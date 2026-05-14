package com.example.demo.audit;

import java.lang.reflect.Method;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.example.demo.clients.AuditLogClient;

@Aspect
@Component
public class ServiceAuditAspect {

    private final AuditLogClient auditLogClient;

    public ServiceAuditAspect(AuditLogClient auditLogClient) {
        this.auditLogClient = auditLogClient;
    }

    @AfterReturning(
        pointcut =
            "execution(* com.example.demo.serviceimpl..*.create*(..)) || " +
            "execution(* com.example.demo.serviceimpl..*.update*(..)) || " +
            "execution(* com.example.demo.serviceimpl..*.delete*(..)) || " +
            "execution(* com.example.demo.serviceImpl..*.create*(..)) || " +
            "execution(* com.example.demo.ServiceImpl..*.update*(..)) || " +
            "execution(* com.example.demo.serviceimpl..*.delete*(..)) || "+
            "execution(* com.example.demo.servicesImplementation..*.create*(..)) || " +
            "execution(* com.example.demo.servicesImplementation..*.update*(..)) || " +
            "execution(* com.example.demo.servicesImplementation..*.delete*(..))",
        returning = "result"
    )
    public void afterSuccess(JoinPoint jp, Object result) {

        String action = resolveAction(jp.getSignature().getName());
        if (!isMutating(action)) return;

        Long userId = getUserId();
        String userName = getUserName();
        String resourceType = resolveResourceType(jp.getTarget().getClass().getSimpleName());
        Long resourceId = resolveResourceId(result, jp.getArgs());

        String details =
            buildDetails(action, resourceType, resourceId, userName, result);

        auditLogClient.log(
            userId,
            action,
            resourceType,
            resourceId,
            details
        );
    }
    
    private String resolveAction(String method) {
        method = method.toLowerCase();
        if (method.startsWith("create")) return "CREATE";
        if (method.startsWith("update")) return "UPDATE";
        if (method.startsWith("delete")) return "DELETE";
        return "READ";
    }

    private boolean isMutating(String action) {
        return action.equals("CREATE") ||
               action.equals("UPDATE") ||
               action.equals("DELETE");
    }
    
    
    private String resolveResourceType(String className) {
        return className.replace("ServiceImpl", "").toUpperCase();
    }
    
    private Long getUserId() {
        RequestAttributes ra = RequestContextHolder.getRequestAttributes();
        if (ra instanceof ServletRequestAttributes sra) {

            // ✅ Primary: From request (JWT filter)
            Object id = sra.getRequest().getAttribute("userId");
            if (id instanceof Number n) return n.longValue();

            // ✅ Fallback: From SecurityContext principal (username → system user)
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                Object principal =
                    SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                if (principal instanceof String username) {
                    // system / admin operation
                    return 1L;
                }
            }
        }
        return 1L;
    }

    private String getUserName() {
        RequestAttributes ra = RequestContextHolder.getRequestAttributes();
        if (ra instanceof ServletRequestAttributes sra) {
            Object name = sra.getRequest().getAttribute("userName");
            return name != null ? name.toString() : "SYSTEM";
        }
        return "SYSTEM";
    }
    
    private Long resolveResourceId(Object result, Object[] args) {
        Long id = extractId(result);
        if (id != null) return id;
        if (args != null) {
            for (Object arg : args) {
                id = extractId(arg);
                if (id != null) return id;
            }
        }
        return null;
    }

    private Long extractId(Object obj) {
        if (obj == null) return null;
        for (Method m : obj.getClass().getMethods()) {
            if (m.getName().matches("get.*Id|get.*ID") &&
                m.getParameterCount() == 0) {
                try {
                    Object v = m.invoke(obj);
                    if (v instanceof Number n) return n.longValue();
                } catch (Exception ignored) {}
            }
        }
        return null;
    }
    
    private String buildDetails(
            String action,
            String resourceType,
            Long id,
            String userName,
            Object obj
    ) {
        StringBuilder sb = new StringBuilder();

        sb.append(resourceType)
          .append(" ")
          .append(action.toLowerCase())
          .append("d");

        if (id != null) sb.append(" [id=").append(id).append("]");
        if (userName != null) sb.append(" by ").append(userName);

        appendBusinessFields(sb, resourceType, obj);
        return sb.toString();
    }
    
    private void appendBusinessFields(
            StringBuilder sb,
            String resourceType,
            Object obj
    ) {
        if (obj == null) return;

        switch (resourceType) {

            /* ====================== 4.1 IAM ====================== */

            case "USER" -> {
                tryAppend(sb, obj, "getName", "name");
                tryAppend(sb, obj, "getRole", "role");
                tryAppend(sb, obj, "getEmail", "email");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "AUDITLOG" -> {
                tryAppend(sb, obj, "getAction", "action");
                tryAppend(sb, obj, "getResourceType", "resourceType");
            }

            /* ====================== 4.2 BOOKING ====================== */

            case "BOOKING" -> {
                tryAppend(sb, obj, "getShipperID", "shipperId");
                tryAppend(sb, obj, "getOriginSiteID", "originSite");
                tryAppend(sb, obj, "getDestinationSiteID", "destinationSite");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "SHIPPER" -> {
                tryAppend(sb, obj, "getName", "name");
                tryAppend(sb, obj, "getStatus", "status");
            }

            /* ====================== 4.3 VEHICLE ====================== */

            case "VEHICLE" -> {
                tryAppend(sb, obj, "getRegNumber", "regNumber");
                tryAppend(sb, obj, "getType", "type");
                tryAppend(sb, obj, "getDriverID", "driverId");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "VEHICLEAVAILABILITY" -> {
                tryAppend(sb, obj, "getVehicleID", "vehicleId");
                tryAppend(sb, obj, "getDate", "date");
                tryAppend(sb, obj, "getStatus", "status");
            }

            /* ====================== 4.4 LOAD / ROUTING ====================== */

            case "LOAD" -> {
                tryAppend(sb, obj, "getLoadCode", "loadCode");
                tryAppend(sb, obj, "getVehicleID", "vehicleId");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "ROUTE" -> {
                tryAppend(sb, obj, "getLoadID", "loadId");
                tryAppend(sb, obj, "getDistanceKm", "distanceKm");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "ROUTINGRULE" -> {
                tryAppend(sb, obj, "getName", "ruleName");
                tryAppend(sb, obj, "getPriority", "priority");
                tryAppend(sb, obj, "getActive", "active");
            }

            /* ====================== 4.5 DISPATCH ====================== */

            case "DISPATCH" -> {
                tryAppend(sb, obj, "getLoadID", "loadId");
                tryAppend(sb, obj, "getAssignedDriverID", "driverId");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "DRIVERACK" -> {
                tryAppend(sb, obj, "getDispatchID", "dispatchId");
                tryAppend(sb, obj, "getDriverID", "driverId");
                tryAppend(sb, obj, "getAckAt", "ackAt");
            }

            /* ====================== 4.6 MANIFEST / DELIVERY ====================== */

            case "MANIFEST" -> {
                tryAppend(sb, obj, "getLoadID", "loadId");
                tryAppend(sb, obj, "getWarehouseID", "warehouseId");
            }

            case "HANDOVER" -> {
                tryAppend(sb, obj, "getManifestID", "manifestId");
                tryAppend(sb, obj, "getReceivedBy", "receivedBy");
            }

            case "PROOFOFDELIVERY" -> {
                tryAppend(sb, obj, "getBookingID", "bookingId");
                tryAppend(sb, obj, "getStatus", "status");
            }

            /* ====================== 4.7 BILLING ====================== */

            case "TARIFF" -> {
                tryAppend(sb, obj, "getServiceType", "serviceType");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "BILLINGLINE" -> {
                tryAppend(sb, obj, "getBookingID", "bookingId");
                tryAppend(sb, obj, "getLoadID", "loadId");
                tryAppend(sb, obj, "getAmount", "amount");
            }

            case "INVOICE" -> {
                tryAppend(sb, obj, "getShipperID", "shipperId");
                tryAppend(sb, obj, "getTotalAmount", "amount");
                tryAppend(sb, obj, "getStatus", "status");
            }

            /* ====================== 4.8 EXCEPTIONS / CLAIMS ====================== */

            case "EXCEPTION", "EXCEPTIONRECORD" -> {
                tryAppend(sb, obj, "getBookingId", "bookingId");
                tryAppend(sb, obj, "getType", "type");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "CLAIM" -> {
                tryAppend(sb, obj, "getExceptionID", "exceptionId");
                tryAppend(sb, obj, "getAmountClaimed", "amount");
                tryAppend(sb, obj, "getStatus", "status");
            }

            /* ====================== 4.9 REPORT / KPI ====================== */

            case "REPORT" -> {
                tryAppend(sb, obj, "getScope", "scope");
                tryAppend(sb, obj, "getGeneratedBy", "generatedBy");
            }

            case "KPI" -> {
                tryAppend(sb, obj, "getName", "name");
                tryAppend(sb, obj, "getCurrentValue", "value");
            }

            /* ====================== 4.10 NOTIFICATION / TASK ====================== */

            case "NOTIFICATION" -> {
                tryAppend(sb, obj, "getCategory", "category");
                tryAppend(sb, obj, "getStatus", "status");
            }

            case "TASK" -> {
                tryAppend(sb, obj, "getAssignedTo", "assignedTo");
                tryAppend(sb, obj, "getStatus", "status");
                tryAppend(sb, obj, "getDueDate", "dueDate");
            }
        }
    }

    private void tryAppend(
            StringBuilder sb,
            Object obj,
            String method,
            String label
    ) {
        try {
            Method m = obj.getClass().getMethod(method);
            Object v = m.invoke(obj);
            if (v != null)
                sb.append(", ").append(label).append("=").append(v);
        } catch (Exception ignored) {}
    }
}





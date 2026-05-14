package com.example.demo.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.access.AccessDeniedException;

import com.example.demo.dto.BookingDetailsDTO;
import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ExceptionRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.service.ExceptionService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
public class ExceptionServiceImpl implements ExceptionService {

    private static final String EXCEPTION_SERVICE_CB = "bookingService";

    @Autowired
    private ExceptionRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationClient notificationClient;
    
    
    @Autowired
    private TaskClient taskClient;

    @Autowired
    private RoleResolverClient roleResolverClient;

    @Override
    public ExceptionRecordDTO createException(ExceptionRecordDTO dto) {
        try {
            if (dto == null) {
                throw new BadRequestException("Exception request body must not be null");
            }
            if (dto.getBookingId() == null) {
                throw new BadRequestException("Booking ID is required");
            }
            if (dto.getType() == null) {
                throw new BadRequestException("Exception type is required. Valid values are: DELAY, DAMAGE, MISSING");
            }
            if (dto.getStatus() == null) {
                dto.setStatus(ExceptionStatus.PENDING);
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                throw new AccessDeniedException("No authentication context found");
            }
            // Extract userId directly from the JWT claim — no IAM round-trip needed
            String token = (authentication.getCredentials() instanceof String t) ? t : null;
            Long userId = (token != null) ? jwtUtil.extractUserId(token) : null;
            if (userId == null) {
                throw new AccessDeniedException("Could not resolve userId from token");
            }

            // Verify the booking exists in the Booking Service before saving
            try {
                BookingDetailsDTO booking = restTemplate.getForObject(
                        "http://BOOKING-SERVICE/cargoRoute/booking/getBookingById/{id}",
                        BookingDetailsDTO.class,
                        dto.getBookingId()
                );
                if (booking == null) {
                    throw new BadRequestException("Booking with ID " + dto.getBookingId() + " does not exist.");
                }
            } catch (HttpClientErrorException.NotFound ex) {
                throw new BadRequestException("Booking with ID " + dto.getBookingId() + " does not exist.");
            } catch (HttpClientErrorException ex) {
                throw new BadRequestException("Booking Service returned error " + ex.getStatusCode() + " for Booking ID " + dto.getBookingId());
            } catch (HttpServerErrorException ex) {
                throw new BadRequestException("Booking Service is experiencing an error (" + ex.getStatusCode() + "). Please try again later.");
            } catch (ResourceAccessException ex) {
                throw new BadRequestException("Cannot reach Booking Service. Please ensure it is running and registered with Eureka.");
            } catch (BadRequestException ex) {
                throw ex;
            } catch (Exception ex) {
                throw new BadRequestException("Could not verify Booking ID " + dto.getBookingId() + ": " + ex.getMessage());
            }

            ExceptionRecord exception = dtoToEntity(dto);
            exception.setReportedBy(userId); // always from auth context, never from frontend
            ExceptionRecord saved = repo.save(exception);

            Long opsUserId = roleResolverClient.getUserByRole("Dispatcher");
            Long adminId = roleResolverClient.getUserByRole("Admin");

         //  Notify Ops / Dispatcher
         notificationClient.notifyUser(
             opsUserId,
             saved.getExceptionID(),
             "New exception reported for Booking " + saved.getBookingId()
                 + " — Type: " + saved.getType(),
             "Exception"
         );
         
     //  Notify Admin
         notificationClient.notifyUser(
             adminId,
             saved.getExceptionID(),
             "New exception reported for Booking " + saved.getBookingId()
                 + " — Type: " + saved.getType(),
             "Exception"
         );

         //  Task for Ops to investigate
         taskClient.createTask(
             opsUserId,
             saved.getExceptionID(),
             "Investigate exception for Booking " + saved.getBookingId()
                 + " (" + saved.getType() + ")",
             null
         );

            

            return entityToDto(saved);
        } catch (AccessDeniedException ex) {
            throw ex;
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to create exception: " + ex.getMessage());
        }
    }

    @Override
    @CircuitBreaker(name = EXCEPTION_SERVICE_CB, fallbackMethod = "getAllExceptionsFallback")
    public List<RequiredResponseDTO> getAllExceptions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String role = (authentication != null) ? authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(null) : null;

        if (role != null && ("ADMIN".equalsIgnoreCase(role) || "DISPATCHER".equalsIgnoreCase(role) || "FLEETMANAGER".equalsIgnoreCase(role)
            || "WAREHOUSEMANAGER".equalsIgnoreCase(role) || "WAREHOUSE_MANAGER".equalsIgnoreCase(role)
            || "BILLINGCLERK".equalsIgnoreCase(role) || "BILLING_CLERK".equalsIgnoreCase(role)
            || "ANALYST".equalsIgnoreCase(role))) {
            return repo.findAll()
                    .stream()
                    .map(e -> getExceptionById(e.getExceptionID()))
                    .collect(Collectors.toList());
        } else {
            // Extract userId directly from the JWT claim
            String token = (authentication != null && authentication.getCredentials() instanceof String t) ? t : null;
            Long userId = (token != null) ? jwtUtil.extractUserId(token) : null;
            if (userId == null) return List.of();
            return repo.findByReportedBy(userId)
                    .stream()
                    .map(e -> getExceptionById(e.getExceptionID()))
                    .collect(Collectors.toList());
        }
    }

    public List<RequiredResponseDTO> getAllExceptionsFallback(Throwable t) {
        return repo.findAll().stream()
                .map(e -> {
                    RequiredResponseDTO fallback = new RequiredResponseDTO();
                    fallback.setExceptiondto(entityToDto(e));
                    fallback.setBookingdto(null);
                    return fallback;
                })
                .collect(Collectors.toList());
    }

    @Override
    @CircuitBreaker(name = EXCEPTION_SERVICE_CB, fallbackMethod = "getExceptionByIdFallback")
    public RequiredResponseDTO getExceptionById(Long id) {
        ExceptionRecord exception = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exception with ID " + id + " not found"));

        RequiredResponseDTO response = new RequiredResponseDTO();
        response.setExceptiondto(entityToDto(exception));

        if (exception.getBookingId() != null) {
            BookingDetailsDTO bookingDto = null;
            String url = "http://BOOKING-SERVICE/cargoRoute/booking/getBookingById/{id}";
            try {
                bookingDto = restTemplate.getForObject(url, BookingDetailsDTO.class, exception.getBookingId());
            } catch (Exception e) {
                bookingDto = null;
            }
            response.setBookingdto(bookingDto);
        }

        return response;
    }

    public RequiredResponseDTO getExceptionByIdFallback(Long id, Throwable t) {
        ExceptionRecord exception = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exception with ID " + id + " not found"));
        RequiredResponseDTO fallback = new RequiredResponseDTO();
        fallback.setExceptiondto(entityToDto(exception));
        fallback.setBookingdto(null);
        return fallback;
    }

    @Override
    public ExceptionRecordDTO updateExceptionStatus(Long id, ExceptionStatus status) {

        ExceptionRecord exception = repo.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Exception with ID " + id + " not found")
                );

        exception.setStatus(status);
        ExceptionRecord updated = repo.save(exception);

        Long opsUserId = roleResolverClient.getUserByRole("Dispatcher");

        //  Notify Reporter
        if (updated.getReportedBy() != null) {
            notificationClient.notifyUser(
                updated.getReportedBy(),
                updated.getExceptionID(),
                "Exception #" + updated.getExceptionID()
                    + " status updated to " + status,
                "Exception"
            );
        }

        //  If not resolved → Ops must act
        if (status != ExceptionStatus.RESOLVED) {

            notificationClient.notifyUser(
                opsUserId,
                updated.getExceptionID(),
                "Exception #" + updated.getExceptionID()
                    + " requires attention. Current status: " + status,
                "Exception"
            );

            taskClient.createTask(
                opsUserId,
                updated.getExceptionID(),
                "Continue investigation for exception on Booking "
                    + updated.getBookingId(),
                null
            );
        }

        return entityToDto(updated);
    }

    @Override
    public List<RequiredResponseDTO> getExceptionByBookingId(Long bookingId) {
        List<ExceptionRecord> exceptions = repo.findByBookingId(bookingId);
        if (exceptions.isEmpty()) {
            throw new ResourceNotFoundException("No exceptions found for booking ID: " + bookingId);
        }
        return exceptions.stream()
                .map(e -> getExceptionById(e.getExceptionID()))
                .collect(Collectors.toList());
    }

    @Override
    public List<RequiredResponseDTO> getExceptionByStatus(ExceptionStatus status) {
        return repo.findByStatus(status).stream()
                .map(e -> getExceptionById(e.getExceptionID()))
                .collect(Collectors.toList());
    }

    private ExceptionRecordDTO entityToDto(ExceptionRecord exception) {
        ExceptionRecordDTO dto = new ExceptionRecordDTO();
        dto.setExceptionID(exception.getExceptionID());
        dto.setType(exception.getType());
        dto.setReportedBy(exception.getReportedBy());
        dto.setReportedAt(exception.getReportedAt());
        dto.setUpdatedAt(exception.getUpdatedAt());
        dto.setDescription(exception.getDescription());
        dto.setStatus(exception.getStatus());
        dto.setBookingId(exception.getBookingId());
        return dto;
    }

    private ExceptionRecord dtoToEntity(ExceptionRecordDTO dto) {
        ExceptionRecord exception = new ExceptionRecord();
        exception.setExceptionID(dto.getExceptionID());
        exception.setType(dto.getType());
        // reportedBy is NOT mapped from DTO — always set from auth context in createException
        exception.setReportedAt(dto.getReportedAt());
        exception.setUpdatedAt(dto.getUpdatedAt());
        exception.setDescription(dto.getDescription());
        exception.setStatus(dto.getStatus());
        exception.setBookingId(dto.getBookingId());
        return exception;
    }
}


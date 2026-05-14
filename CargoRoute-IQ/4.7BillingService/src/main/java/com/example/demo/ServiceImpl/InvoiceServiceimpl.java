package com.example.demo.ServiceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.service.InvoiceService;
import com.example.demo.dto.InvoiceDTO;
import com.example.demo.dto.InvoiceRequiredResponseDTO;
import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.Invoice;
import com.example.demo.exception.InvoiceNotFoundException;
import com.example.demo.repository.InvoiceRepository;

@Service
public class InvoiceServiceimpl implements InvoiceService {

    @Autowired
    private InvoiceRepository repo;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TaskClient taskClient;
    
    @Autowired
    private RoleResolverClient roleResolverClient;

    // ================= DTO → ENTITY =================
    private Invoice toEntity(InvoiceDTO dto) {
        Invoice entity = new Invoice();
        entity.setInvoiceID(dto.getInvoiceID());
        entity.setShipperID(dto.getShipperID());
        entity.setPeriodStart(dto.getPeriodStart().toLocalDate());
        entity.setPeriodEnd(dto.getPeriodEnd().toLocalDate());
        entity.setLinesJSON(dto.getLinesJSON());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setIssuedAt(LocalDateTime.now());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    // ================= ENTITY → DTO =================
    private InvoiceDTO toDTO(Invoice entity) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setInvoiceID(entity.getInvoiceID());
        dto.setShipperID(entity.getShipperID());
        dto.setPeriodStart(entity.getPeriodStart().atStartOfDay());
        dto.setPeriodEnd(entity.getPeriodEnd().atStartOfDay());
        dto.setLinesJSON(entity.getLinesJSON());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setIssuedAt(entity.getIssuedAt());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    // ================= CREATE =================
    @Override
    public InvoiceDTO save(InvoiceDTO invoice) {

        Invoice saved = repo.save(toEntity(invoice));

        Long billingUserId =roleResolverClient.getUserByRole("BillingClerk");
        Long adminId =roleResolverClient.getUserByRole("Admin");

        //  Notify Shipper (informational)
        notificationClient.notifyUser(
            saved.getShipperID(),
            saved.getInvoiceID(),
            "Invoice " + saved.getInvoiceID() + " has been generated.",
            "Invoice"
        );

        //  Notify Billing (actionable)
        notificationClient.notifyUser(
            billingUserId,
            saved.getInvoiceID(),
            "Invoice " + saved.getInvoiceID() + " generated and pending review.",
            "Invoice"
        );
        
        //  Notify Admin
        notificationClient.notifyUser(
            adminId,
            saved.getInvoiceID(),
            "Invoice " + saved.getInvoiceID() + " generated and pending review.",
            "Invoice"
        );

        //  Task ONLY for Billing
        taskClient.createTask(
            billingUserId,
            saved.getInvoiceID(),
            "Review and finalize invoice " + saved.getInvoiceID(),
            saved.getPeriodEnd() != null
                ? saved.getPeriodEnd()
                : LocalDate.now()
        );

        return toDTO(saved);
    }

    // ================= GET ALL =================
    @Override
    public List<InvoiceRequiredResponseDTO> getAll() {
        List<Invoice> invoices = repo.findAll();
        if (invoices.isEmpty()) {
            throw new InvoiceNotFoundException("No invoices found");
        }

        return invoices.stream().map(invoice -> {

            InvoiceDTO invoiceDTO = toDTO(invoice);
            ShipperDTO shipperDTO;

            try {
                shipperDTO = restTemplate.getForObject(
                        "http://BOOKING-SERVICE/cargoRoute/shipper/getShipper/" + invoice.getShipperID(),
                        ShipperDTO.class
                );
            } catch (Exception e) {
                shipperDTO = null;
            }

            InvoiceRequiredResponseDTO response = new InvoiceRequiredResponseDTO();
            response.setInvoice(invoiceDTO);
            response.setShipper(shipperDTO);
            return response;

        }).toList();
    }

    // ================= GET BY ID =================
    @Override
    public InvoiceRequiredResponseDTO getById(Long id) {

        Invoice invoice = repo.findById(id)
                .orElseThrow(() ->
                        new InvoiceNotFoundException(
                                "Invoice not found with id: " + id)
                );

        InvoiceDTO invoiceDTO = toDTO(invoice);
        ShipperDTO shipperDTO;

        try {
            shipperDTO = restTemplate.getForObject(
                    "http://BOOKING-SERVICE/cargoRoute/shipper/getShipper/" + invoice.getShipperID(),
                    ShipperDTO.class
            );
        } catch (Exception e) {
            shipperDTO = null;
        }

        InvoiceRequiredResponseDTO response = new InvoiceRequiredResponseDTO();
        response.setInvoice(invoiceDTO);
        response.setShipper(shipperDTO);
        return response;
    }

    // ================= UPDATE =================
    @Override
    public InvoiceDTO update(Long id, InvoiceDTO invoiceDTO) {

        Invoice existing = repo.findById(id)
                .orElseThrow(() ->
                    new InvoiceNotFoundException(
                        "Invoice not found with id: " + id)
                );

        existing.setShipperID(invoiceDTO.getShipperID());
        existing.setPeriodStart(invoiceDTO.getPeriodStart().toLocalDate());
        existing.setPeriodEnd(invoiceDTO.getPeriodEnd().toLocalDate());
        existing.setLinesJSON(invoiceDTO.getLinesJSON());
        existing.setTotalAmount(invoiceDTO.getTotalAmount());
        existing.setStatus(invoiceDTO.getStatus());

        Invoice updated = repo.save(existing);

        Long billingUserId =
            roleResolverClient.getUserByRole("BillingClerk");

        //  Notify Shipper
        notificationClient.notifyUser(
            updated.getShipperID(),
            updated.getInvoiceID(),
            "Invoice " + updated.getInvoiceID() +
                " updated. Current status: " + updated.getStatus(),
            "Invoice"
        );

        //  Notify Billing
        notificationClient.notifyUser(
            billingUserId,
            updated.getInvoiceID(),
            "Invoice " + updated.getInvoiceID() +
                " updated. Status requires attention.",
            "Invoice"
        );
        
        Long adminId= roleResolverClient.getUserByRole("Admin");
        
        //  Notify Admin
        notificationClient.notifyUser(
            adminId,
            updated.getInvoiceID(),
            "Invoice " + updated.getInvoiceID() +
                " updated. Status requires attention.",
            "Invoice"
        );

        //  Task ONLY if invoice is not settled
        if (!"PAID".equalsIgnoreCase(updated.getStatus())) {
            taskClient.createTask(
                billingUserId,
                updated.getInvoiceID(),
                "Reconcile updated invoice " + updated.getInvoiceID(),
                updated.getPeriodEnd() != null
                    ? updated.getPeriodEnd()
                    : LocalDate.now()
            );
        }

        return toDTO(updated);
    }

    // ================= DELETE =================
    @Override
    public void delete(Long id) {

        if (!repo.existsById(id)) {
            throw new InvoiceNotFoundException(
                    "Invoice not found with id: " + id);
        }

        repo.deleteById(id);
    }
}
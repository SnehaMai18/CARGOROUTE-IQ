package com.example.demo.ServiceImpl;
 
import java.util.List;
import java.util.stream.Collectors;
 
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
 
import com.example.demo.dto.BillingLineDTO;
import com.example.demo.dto.BillingLineResponseDTO;
import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.BillingLine;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BillingLineRepository;
import com.example.demo.service.BillingLineService;
 
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
 
@Service
public class BillingLineServiceImpl implements BillingLineService {
 
    private final BillingLineRepository repository;
    private final RestTemplate restTemplate;
 
    public BillingLineServiceImpl(BillingLineRepository repository,
                                  RestTemplate restTemplate) {
        this.repository = repository;
        this.restTemplate = restTemplate;
    }
 
    // ================= CRUD OPERATIONS =================
 
    @Override
    public BillingLineResponseDTO create(BillingLineDTO dto) {
        BillingLine saved = repository.save(toEntity(dto));
        return buildResponse(saved);
    }
 
    @Override
    public BillingLineResponseDTO getById(Long id) {
        BillingLine billingLine = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BillingLine not found"));
        return buildResponse(billingLine);
    }
 
    @Override
    public List<BillingLineResponseDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }
 
    @Override
    public BillingLineResponseDTO update(Long id, BillingLineDTO dto) {
        BillingLine billingLine = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BillingLine not found"));
 
        billingLine.setAmount(dto.getAmount());
        billingLine.setTariffApplied(dto.getTariffApplied());
        billingLine.setNotes(dto.getNotes());
 
        return buildResponse(repository.save(billingLine));
    }
 
    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("BillingLine not found");
        }
        repository.deleteById(id);
    }
 
    // ================= RESPONSE BUILDER =================
 
    /**
     * Builds the final BillingLineResponseDTO by
     * combining:
     * - Billing data (DB)
     * - Booking data (Booking Service)
     * - Load + Vehicle + Driver data (Load Service)
     */
    private BillingLineResponseDTO buildResponse(BillingLine billingLine) {
 
        BookingDTO booking;
        try {
            booking = getBookingWithCB(billingLine.getBookingID());
        } catch (Exception e) {
            booking = bookingFallback(billingLine.getBookingID(), e);
        }
 
        RequiredResponseDTO load;
        try {
            load = getLoadWithCB(billingLine.getLoadID());
        } catch (Exception e) {
            load = loadFallback(billingLine.getLoadID(), e);
        }
 
        BillingLineResponseDTO response = new BillingLineResponseDTO();
        response.setBilling(toDTO(billingLine));
        response.setBooking(booking);
        response.setLoad(load);
 
        return response;
    }
 
    // ================= REST CALLS + CIRCUIT BREAKERS =================
 
    @CircuitBreaker(name = "bookingService", fallbackMethod = "bookingFallback")
    public BookingDTO getBookingWithCB(Long bookingID) {
        return restTemplate.getForObject(
                "http://BOOKING-SERVICE/cargoRoute/booking/getBookingById/" + bookingID,
                BookingDTO.class);
    }
 
    @CircuitBreaker(name = "loadService", fallbackMethod = "loadFallback")
    public RequiredResponseDTO getLoadWithCB(Long loadID) {
        return restTemplate.getForObject(
                "http://ROUTING-SERVICE/cargoRoute/loads/getLoad/" + loadID,
                RequiredResponseDTO.class);
    }
 
    // ================= FALLBACK METHODS =================
 
    public BookingDTO bookingFallback(Long bookingID, Throwable ex) {
        BookingDTO dto = new BookingDTO();
        dto.setBookingID(bookingID);
        return dto;
    }
 
    public RequiredResponseDTO loadFallback(Long loadID, Throwable ex) {
        RequiredResponseDTO dto = new RequiredResponseDTO();
//        dto.setMessage("Load service unavailable");
        return dto;
    }
 
    // ================= ENTITY ↔ DTO MAPPERS =================
 
    private BillingLine toEntity(BillingLineDTO dto) {
        BillingLine b = new BillingLine();
        b.setBookingID(dto.getBookingID());
        b.setLoadID(dto.getLoadID());
        b.setAmount(dto.getAmount());
        b.setTariffApplied(dto.getTariffApplied());
        b.setNotes(dto.getNotes());
        return b;
    }
 
    private BillingLineDTO toDTO(BillingLine entity) {
        BillingLineDTO dto = new BillingLineDTO();
        dto.setBillingLineID(entity.getBillingLineID());
        dto.setBookingID(entity.getBookingID());
        dto.setLoadID(entity.getLoadID());
        dto.setAmount(entity.getAmount());
        dto.setTariffApplied(entity.getTariffApplied());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
 
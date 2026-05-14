package com.example.demo.serviceimpl;

import java.io.File;

import java.util.ArrayList;

import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import org.springframework.web.multipart.MultipartFile;
 
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.BookingDTO;

import com.example.demo.dto.ProofOfDeliveryDTO;

import com.example.demo.dto.ProofOfDeliveryResponseDTO;

import com.example.demo.entities.ProofOfDelivery;

import com.example.demo.entities.enums.PodType;

import com.example.demo.entities.enums.ProofOfDeliveryStatus;

import com.example.demo.exception.BadRequestException;

import com.example.demo.exception.ResourceNotFoundException;

import com.example.demo.repository.ProofOfDeliveryRepository;

import com.example.demo.service.ProofOfDeliveryService;
 
@Service

public class ProofOfDeliveryServiceImpl implements ProofOfDeliveryService {
    private static final String POD_CB = "podService";
    
    @Value("${pod.upload-dir}")
    private String podUploadDir;
    
    @Autowired
    private ProofOfDeliveryRepository repository;
 
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TaskClient taskClient;

    @Autowired
    private RoleResolverClient roleResolverClient;
 
    private static final String BOOKING_SERVICE_URL =
            "http://BOOKING-SERVICE/cargoRoute/booking/getBookingById/";
 
    

    private String savePodImage(MultipartFile file) {
        try {
            File dir = new File(podUploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destination = new File(dir, fileName);
            file.transferTo(destination);
            return "/pods/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload POD image", e);
        }

    }

    @Override
    public ProofOfDeliveryDTO create(ProofOfDeliveryDTO dto, MultipartFile file) {
        if (dto.getBookingID() == null) {
            throw new BadRequestException("bookingID is mandatory");
        }
 
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("POD image is required");
        }
 
        String type = file.getContentType();
        if (!"image/jpeg".equals(type) && !"image/png".equals(type)) {
            throw new BadRequestException("Only JPG or PNG allowed");

        }
 
        String podUri = savePodImage(file);
        ProofOfDelivery pod = convertToEntity(dto);
        pod.setPodURI(podUri);
        pod.setStatus(ProofOfDeliveryStatus.UPLOADED);
        ProofOfDelivery saved = repository.save(pod);
        
        Long dispatcherUserId = roleResolverClient.getUserByRole("Dispatcher");
        Long shipperUserId = roleResolverClient.getUserByRole("Shipper"); // resolved by booking → shipper → user mapping
        Long adminId = roleResolverClient.getUserByRole("Admin");
        // Notify Dispatcher
        notificationClient.notifyUser(
            dispatcherUserId,
            saved.getPodID(),
            "Proof of Delivery uploaded for booking " + saved.getBookingID(),
            "Delivery"
        );
        
     // Notify admin
        notificationClient.notifyUser(
            adminId,
            saved.getPodID(),
            "Proof of Delivery uploaded for booking " + saved.getBookingID(),
            "Delivery"
        );

        //  Notify Shipper (if resolvable)
        if (shipperUserId != null) {
            notificationClient.notifyUser(
                shipperUserId,
                saved.getPodID(),
                "Your shipment has been delivered successfully",
                "Delivery"
            );
        }
 
        return convertToDTO(repository.save(pod));

    }
 
    // ================= FETCH BY ID =================

    @Override

    @CircuitBreaker(name = POD_CB, fallbackMethod = "getByIdFallback")
    public ProofOfDeliveryResponseDTO getById(Long podID) {
        return buildResponse(findPod(podID));
    }

    public ProofOfDeliveryResponseDTO getByIdFallback(Long podID, Throwable t) {
        ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
        response.setProofOfDelivery(convertToDTO(findPod(podID)));
        response.setBooking(null);
        return response;

    }

 
    // ================= FETCH ALL =================

    @Override
    @CircuitBreaker(name = POD_CB, fallbackMethod = "getAllFallback")
    public List<ProofOfDeliveryResponseDTO> getAll() {
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : repository.findAll()) {
            responses.add(buildResponse(pod));
        }
        return responses;

    }
 
    public List<ProofOfDeliveryResponseDTO> getAllFallback(Throwable t) {
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : repository.findAll()) {
            ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
            response.setProofOfDelivery(convertToDTO(pod));
            response.setBooking(null);
            responses.add(response);
        }
        return responses;

    }
 
    // ================= FETCH BY BOOKING ID =================

    @Override
    @CircuitBreaker(name = POD_CB, fallbackMethod = "getByBookingIDFallback")
    public ProofOfDeliveryResponseDTO getByBookingID(Long bookingID) {
        ProofOfDelivery pod = repository.findByBookingID(bookingID);
        if (pod == null) {
            throw new ResourceNotFoundException(
                    "POD not found for bookingID: " + bookingID);
        }

        return buildResponse(pod);
    }
 
    public ProofOfDeliveryResponseDTO getByBookingIDFallback(
            Long bookingID, Throwable t) {
        ProofOfDelivery pod = repository.findByBookingID(bookingID);
        if (pod == null) {
            throw new ResourceNotFoundException(
                    "POD not found for bookingID: " + bookingID);
        }
 
        ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
        response.setProofOfDelivery(convertToDTO(pod));
        response.setBooking(null);
        return response;

    }
 
    // ================= FETCH BY POD TYPE (✅ FIXED) =================

    @Override
    @CircuitBreaker(name = POD_CB, fallbackMethod = "getByPodTypeFallback")
    public List<ProofOfDeliveryResponseDTO> getByPodType(PodType podType) {
        List<ProofOfDelivery> pods = repository.findByPodType(podType);
        if (pods.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No Proof Of Delivery found for podType: " + podType);

        }
 
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            responses.add(buildResponse(pod));
        }
        return responses;

    }
 
    public List<ProofOfDeliveryResponseDTO> getByPodTypeFallback(
            PodType podType, Throwable t) {
        List<ProofOfDelivery> pods = repository.findByPodType(podType);
        if (pods.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No Proof Of Delivery found for podType: " + podType);
        }
 
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
            response.setProofOfDelivery(convertToDTO(pod));
            response.setBooking(null);
            responses.add(response);
        }
        return responses;
    }
 
    // ================= FETCH BY STATUS (✅ FIXED) =================

    @Override
    @CircuitBreaker(name = POD_CB, fallbackMethod = "getByProofOfDeliveryStatusFallback")
    public List<ProofOfDeliveryResponseDTO> getByProofOfDeliveryStatus(
            ProofOfDeliveryStatus status) {
        List<ProofOfDelivery> pods = repository.findByStatus(status);
        if (pods.isEmpty()) {
            throw new ResourceNotFoundException("No Proof Of Delivery found for status: " + status);
        }

        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            responses.add(buildResponse(pod));
        }
        return responses;
    }
 
    public List<ProofOfDeliveryResponseDTO> getByProofOfDeliveryStatusFallback(
            ProofOfDeliveryStatus status, Throwable t) {
        List<ProofOfDelivery> pods = repository.findByStatus(status);
        if (pods.isEmpty()) {
        	
            // Let GlobalExceptionHandler handle it
            throw new ResourceNotFoundException(
                "No Proof Of Delivery found for status: " + status
            );
        }
 
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
            response.setProofOfDelivery(convertToDTO(pod));
            response.setBooking(null);
            responses.add(response);
        }
        return responses;

    }
 
    // ================= FETCH BY DRIVER ID =================
    @Override
    @CircuitBreaker(name = POD_CB, fallbackMethod = "getByDriverIdFallback")
    public List<ProofOfDeliveryResponseDTO> getByDriverId(Long driverId) {
        List<ProofOfDelivery> pods = repository.findByDriverId(driverId);
        if (pods.isEmpty()) {
            throw new ResourceNotFoundException(
                "No Proof Of Delivery found for driverId: " + driverId);
        }
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            responses.add(buildResponse(pod));
        }
        return responses;
    }

    public List<ProofOfDeliveryResponseDTO> getByDriverIdFallback(
            Long driverId, Throwable t) {
        List<ProofOfDelivery> pods = repository.findByDriverId(driverId);
        if (pods.isEmpty()) {
            throw new ResourceNotFoundException(
                "No Proof Of Delivery found for driverId: " + driverId);
        }
        List<ProofOfDeliveryResponseDTO> responses = new ArrayList<>();
        for (ProofOfDelivery pod : pods) {
            ProofOfDeliveryResponseDTO response = new ProofOfDeliveryResponseDTO();
            response.setProofOfDelivery(convertToDTO(pod));
            response.setBooking(null);
            responses.add(response);
        }
        return responses;
    }
 
    // ================= UPDATE =================

    @Override
    public ProofOfDeliveryDTO update(Long podID, ProofOfDeliveryDTO dto) {

        ProofOfDelivery pod = findPod(podID);

        if (dto.getReceivedBy() != null)
            pod.setReceivedBy(dto.getReceivedBy());

        if (dto.getPodType() != null)
            pod.setPodType(dto.getPodType());

        if (dto.getStatus() != null)
            pod.setStatus(dto.getStatus());

        ProofOfDelivery updated = repository.save(pod);

        Long dispatcherUserId = roleResolverClient.getUserByRole("Dispatcher");
        Long adminId = roleResolverClient.getUserByRole("Admin");

        // Normal update → Delivery notification
        if (dto.getStatus() == ProofOfDeliveryStatus.UPLOADED) {

            notificationClient.notifyUser(
                dispatcherUserId,
                updated.getPodID(),
                "Proof of Delivery updated for booking " + updated.getBookingID(),
                "Delivery"
            );
        }
        
        if (dto.getStatus() == ProofOfDeliveryStatus.UPLOADED) {

            notificationClient.notifyUser(
                adminId,
                updated.getPodID(),
                "Proof of Delivery updated for booking " + updated.getBookingID(),
                "Delivery"
            );
        }

        // Failure path → Exception + Task
        if (dto.getStatus() == ProofOfDeliveryStatus.REJECTED) {

            notificationClient.notifyUser(
                dispatcherUserId,
                updated.getPodID(),
                "Delivery issue reported for booking " + updated.getBookingID(),
                "Delivery"
            );

            taskClient.createTask(
                dispatcherUserId,
                updated.getPodID(),
                "Investigate delivery failure for booking " + updated.getBookingID(),
                null
            );
        }

        return convertToDTO(updated);
    }

 
    // ================= DELETE =================

    @Override

    public void delete(Long podID) {
        repository.delete(findPod(podID));
    }
 
    // ================= REMOTE CALL =================

    @CircuitBreaker(name = "bookingService", fallbackMethod = "bookingFallback")
    private BookingDTO callBookingService(Long bookingID) {
        return restTemplate.getForObject(BOOKING_SERVICE_URL + bookingID, BookingDTO.class);
    }
    private BookingDTO bookingFallback(Long bookingID, Throwable ex) {
        return null;
    }
 
    // ================= RESPONSE BUILDER =================

    private ProofOfDeliveryResponseDTO buildResponse(ProofOfDelivery pod) {
        ProofOfDeliveryResponseDTO response =
                new ProofOfDeliveryResponseDTO();
        response.setProofOfDelivery(convertToDTO(pod));
        try {
            BookingDTO booking =
                    callBookingService(pod.getBookingID());
            response.setBooking(booking);
        } catch (Exception ex) {
            response.setBooking(null);
        }
        return response;
    }
 
    // ================= UTILITIES =================

    private ProofOfDelivery findPod(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("POD not found with ID: " + id));
    }
 
    private ProofOfDeliveryDTO convertToDTO(ProofOfDelivery pod) {
        ProofOfDeliveryDTO dto = new ProofOfDeliveryDTO();
        dto.setPodID(pod.getPodID());
        dto.setBookingID(pod.getBookingID());
        dto.setDriverId(pod.getDriverId());
        dto.setDeliveredAt(pod.getDeliveredAt());
        dto.setReceivedBy(pod.getReceivedBy());
        dto.setPodURI(pod.getPodURI());
        dto.setPodType(pod.getPodType());
        dto.setStatus(pod.getStatus());
        return dto;

    }
 
    private ProofOfDelivery convertToEntity(ProofOfDeliveryDTO dto) {
        ProofOfDelivery pod = new ProofOfDelivery();
        pod.setBookingID(dto.getBookingID());
        pod.setDriverId(dto.getDriverId());
        pod.setReceivedBy(dto.getReceivedBy());
        pod.setPodURI(dto.getPodURI());
        pod.setPodType(dto.getPodType());
        pod.setStatus(dto.getStatus());
        return pod;
    }

}
 
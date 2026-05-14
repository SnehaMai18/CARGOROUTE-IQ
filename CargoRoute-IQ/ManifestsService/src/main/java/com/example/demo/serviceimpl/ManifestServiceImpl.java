package com.example.demo.serviceimpl;


import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.LoadResponseDTO;
import com.example.demo.dto.ManifestDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;
import com.example.demo.dto.VehicleDTO;
import com.example.demo.entities.Manifest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ManifestRepository;
import com.example.demo.service.ManifestService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
 
@Service
public class ManifestServiceImpl implements ManifestService {
 
    private static final String MANIFEST_CB = "manifestService";
 
    @Autowired
    private ManifestRepository manifestRepository;
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TaskClient taskClient;
    
    @Autowired
    private RoleResolverClient roleResolverClient;

 
    @Value("${file.upload-dir}")
    private String uploadDir;
 
    private static final String LOAD_SERVICE_URL =
            "http://ROUTING-SERVICE/cargoRoute/loads/getLoad/";
 
    private static final String FLEET_SERVICE_URL =
            "http://FLEET-SERVICE/cargoRoute/vehicles/getVehicle/";
 
 
    //FETCH BY ID

    @Override
    @CircuitBreaker(name = MANIFEST_CB, fallbackMethod = "getByIdFallback")
    public ManifestRequiredResponseDTO getById(Long manifestID) {
        return buildResponse(findManifest(manifestID));

        
    }
    public ManifestRequiredResponseDTO getByIdFallback(Long manifestID, Throwable t) {
        ManifestRequiredResponseDTO response = new ManifestRequiredResponseDTO();
        response.setManifest(convertToDTO(findManifest(manifestID)));
        response.setLoad(null);
        response.setVehicle(null);
        return response;
    }
 
    
    //FETCH ALL

    @Override
    @CircuitBreaker(name = MANIFEST_CB, fallbackMethod = "getAllFallback")
    public List<ManifestRequiredResponseDTO> getAll() {
        List<ManifestRequiredResponseDTO> responses = new ArrayList<>();
        for (Manifest manifest : manifestRepository.findAll()) {
            responses.add(buildResponse(manifest));
        }
        return responses;
    }
    
    public List<ManifestRequiredResponseDTO> getAllFallback(Throwable t) {
        List<ManifestRequiredResponseDTO> responses = new ArrayList<>();
        for (Manifest manifest : manifestRepository.findAll()) {
            ManifestRequiredResponseDTO response = new ManifestRequiredResponseDTO();
            response.setManifest(convertToDTO(manifest));
            response.setLoad(null);
            response.setVehicle(null);
            responses.add(response);

        }
        return responses;
    }
 
    // ================= FETCH BY LOAD ID =================

    @Override
    @CircuitBreaker(name = MANIFEST_CB, fallbackMethod = "getByLoadIDFallback")
    public ManifestRequiredResponseDTO getByLoadID(Long loadID) {
        Manifest manifest = manifestRepository.findByLoadID(loadID);
        if (manifest == null) {
            throw new ResourceNotFoundException("Manifest not found for loadID: " + loadID);
        }
        return buildResponse(manifest);

    }
    public ManifestRequiredResponseDTO getByLoadIDFallback(Long loadID, Throwable t) {
        Manifest manifest = manifestRepository.findByLoadID(loadID);
        if (manifest == null) {
            throw new ResourceNotFoundException("Manifest not found for loadID: " + loadID);
        }
 
        ManifestRequiredResponseDTO response = new ManifestRequiredResponseDTO();
        response.setManifest(convertToDTO(manifest));
        response.setLoad(null);
        response.setVehicle(null);
        return response;

    }
 
    //FETCH BY WAREHOUSE ID 

    @Override
    @CircuitBreaker(name = MANIFEST_CB, fallbackMethod = "getByWarehouseIDFallback")
    public List<ManifestRequiredResponseDTO> getByWarehouseID(Long warehouseID) {
        List<Manifest> manifests = manifestRepository.findByWarehouseID(warehouseID);
        if (manifests.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No manifests found for warehouseID: " + warehouseID);
        }
        List<ManifestRequiredResponseDTO> responses = new ArrayList<>();
        for (Manifest manifest : manifests) {
            responses.add(buildResponse(manifest));
        }
        return responses;
    }
 
    public List<ManifestRequiredResponseDTO> getByWarehouseIDFallback(
            Long warehouseID, Throwable t) {
        List<Manifest> manifests = manifestRepository.findByWarehouseID(warehouseID);
        if (manifests.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No manifests found for warehouseID: " + warehouseID);
        }
 
        List<ManifestRequiredResponseDTO> responses = new ArrayList<>();
        for (Manifest manifest : manifests) {
            ManifestRequiredResponseDTO response = new ManifestRequiredResponseDTO();
            response.setManifest(convertToDTO(manifest));
            response.setLoad(null);
            response.setVehicle(null);
            responses.add(response);
        }
        return responses;

    }
 
    //UPDATE 
    @Override
    public ManifestDTO update(Long manifestID, ManifestDTO manifestDTO) {
        Manifest manifest = findManifest(manifestID);
        if (manifestDTO.getWarehouseID() != null)
            manifest.setWarehouseID(manifestDTO.getWarehouseID());

        if (manifestDTO.getItemsJSON() != null)
            manifest.setItemsJSON(manifestDTO.getItemsJSON());

        Manifest updated = manifestRepository.save(manifest);

        Long dispatcherUserId = roleResolverClient.getUserByRole("Dispatcher");
        Long driverId = roleResolverClient.getUserByRole("Driver");

        notificationClient.notifyUser(
            dispatcherUserId,                 //Long userId
            updated.getManifestID(),
            "Manifest prepared for load " + updated.getLoadID(),
            "Pickup"
        );
        //notify admin
        notificationClient.notifyUser(
                dispatcherUserId,                 //Long userId
                updated.getManifestID(),
                "Manifest prepared for load " + updated.getLoadID(),
                "Pickup"
            );
        
        //  Task for Driver to receive handover
        taskClient.createTask(
            driverId,
            updated.getManifestID(),
            "Receive handover for manifest",
            null
        );

        return convertToDTO(updated);
    }
 
    //DELETE
    @Override
    public void delete(Long manifestID) {
        if (!manifestRepository.existsById(manifestID)) {
            throw new ResourceNotFoundException(
                    "Manifest not found with ID: " + manifestID);
        }
        manifestRepository.deleteById(manifestID);
    }
 
    @CircuitBreaker(name = "loadService", fallbackMethod = "loadFallback")
    private LoadResponseDTO callLoadService(Long loadId) {
        return restTemplate.getForObject(
                LOAD_SERVICE_URL + loadId,
                LoadResponseDTO.class
        );
    }
    private LoadResponseDTO loadFallback(Long loadId, Throwable ex) {
        return null; 
        }
   
    
    @CircuitBreaker(name = "fleetService", fallbackMethod = "fleetFallback")
    private VehicleDTO callFleetService(Long vehicleId) {
        return restTemplate.getForObject(
                FLEET_SERVICE_URL + vehicleId,
                VehicleDTO.class
        );
    }
    private VehicleDTO fleetFallback(Long vehicleId, Throwable ex) {
        return null;
    }

    //RESPONSE BUILDER (DEFENSIVE) 
    private ManifestRequiredResponseDTO buildResponse(Manifest manifest) {
        ManifestRequiredResponseDTO response = new ManifestRequiredResponseDTO();
        response.setManifest(convertToDTO(manifest));
        try {
            LoadResponseDTO loadResponse =
                    callLoadService(manifest.getLoadID());
            if (loadResponse == null || loadResponse.getLoad() == null) {
                response.setLoad(null);
                response.setVehicle(null);
                return response;
            }
 
            LoadDTO load = loadResponse.getLoad();
            response.setLoad(load);
            if (load.getVehicleID() != null) {
                VehicleDTO vehicle = callFleetService(load.getVehicleID());
                response.setVehicle(vehicle);
            } else {
                response.setVehicle(null);
            }
        } catch (Exception ex) {
            response.setLoad(null);
            response.setVehicle(null);
        }

        return response;
    }
    @Override
    public String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new RuntimeException("File is missing");
        try {
            File directory = new File(uploadDir).getAbsoluteFile();
            if (!directory.exists()) { directory.mkdirs(); }
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destination = new File(directory, fileName);
            file.transferTo(destination);
            return "/manifests/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }
 
    @Override
    public ManifestDTO create(ManifestDTO dto, MultipartFile file) {
        String uri = saveFile(file); 
        Manifest manifest = convertToEntity(dto);
        manifest.setManifestURI(uri);
        ManifestDTO saved= convertToDTO(manifestRepository.save(manifest));

       //  ADD BELOW
         notificationClient.notifyUser(
             dto.getWarehouseID(),              // Warehouse user
             saved.getManifestID(),
             "Manifest created for load " + saved.getLoadID(),
             "Pickup"
         );

         Long adminId= roleResolverClient.getUserByRole("Admin");
         //notify admin also
         notificationClient.notifyUser(
                 adminId,              // Warehouse user
                 saved.getManifestID(),
                 "Manifest created for load " + saved.getLoadID(),
                 "Pickup"
             );

        return saved;

    }

    private Manifest findManifest(Long id) {
        return manifestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manifest not found with ID: " + id));
    }
 
    private ManifestDTO convertToDTO(Manifest manifest) {
        ManifestDTO dto = new ManifestDTO();
        dto.setManifestID(manifest.getManifestID());
        dto.setLoadID(manifest.getLoadID());
        dto.setWarehouseID(manifest.getWarehouseID());
        dto.setItemsJSON(manifest.getItemsJSON());
        dto.setCreatedBy(manifest.getCreatedBy());
        dto.setCreatedAt(manifest.getCreatedAt());
        dto.setManifestURI(manifest.getManifestURI());
        return dto;

    }
    private Manifest convertToEntity(ManifestDTO dto) {
        Manifest manifest = new Manifest();
        manifest.setLoadID(dto.getLoadID());
        manifest.setWarehouseID(dto.getWarehouseID());
        manifest.setItemsJSON(dto.getItemsJSON());
        manifest.setCreatedBy(dto.getCreatedBy());
        return manifest;
    }
}

 
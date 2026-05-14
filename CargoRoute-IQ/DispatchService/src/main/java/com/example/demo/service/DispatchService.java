package com.example.demo.service;
import com.example.demo.dto.DispatchDTO;
import com.example.demo.dto.DispatchResponseDTO;
import com.example.demo.entities.Dispatch;
import com.example.demo.entities.enums.DispatchStatus;

import java.util.List;

public interface DispatchService {

	//Create a new dispatch
    public DispatchDTO insert(DispatchDTO dispatchDTO);

    //Get dispatch by dispatch ID
    public DispatchResponseDTO fetchByID(Long dispatchID);
    
    //Get dispatch by load ID
    public DispatchResponseDTO findByLoadID(Long loadID);
    

    //Get dispatches by assigned by (dispatcher name)
    public List<DispatchResponseDTO> fetchByAssignedBy(String assignedBy);

    //Get dispatches by status
    public List<DispatchResponseDTO> fetchByStatus(DispatchStatus status);

    //Get all dispatches
    public List<DispatchResponseDTO> fetchAll();

    //Update dispatch
    public DispatchDTO updateDispatch(Long dispatchID, DispatchDTO dispatchDTO);

    //Delete dispatch by ID
    public void delete(Long dispatchID);
}

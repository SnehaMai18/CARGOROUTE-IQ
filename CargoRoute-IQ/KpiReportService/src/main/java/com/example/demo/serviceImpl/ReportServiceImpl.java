package com.example.demo.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.ReportDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.exception.ReportNotFoundException;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.ReportService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ReportRepo repo;

    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TaskClient taskClient;

    // ================= ENTITY → DTO =================
    private ReportDTO toDTO(Report entity) {
        if (entity == null) return null;

        ReportDTO dto = new ReportDTO();
        dto.setReportID(entity.getReportID());
        dto.setScope(entity.getScope().name());
        dto.setParametersJSON(entity.getParametersJSON());
        dto.setMetricsJSON(entity.getMetricsJSON());
        dto.setGeneratedBy(entity.getGeneratedBy());
        dto.setGeneratedAt(entity.getGeneratedAt() != null
                ? entity.getGeneratedAt().toString()
                : null);
        return dto;
    }

    // ================= DTO → ENTITY =================
    private Report toEntity(ReportDTO dto) {
        if (dto == null) return null;

        Report entity = new Report();
        entity.setReportID(dto.getReportID());
        entity.setScope(ReportScope.valueOf(dto.getScope()));
        entity.setParametersJSON(dto.getParametersJSON());
        entity.setMetricsJSON(dto.getMetricsJSON());
        entity.setGeneratedBy(dto.getGeneratedBy());
        entity.setGeneratedAt(LocalDateTime.now());

        return entity;
    }

    // ================= SAVE =================
    @Override
    public ReportDTO save(ReportDTO report) {
        Report saved = repo.save(toEntity(report));

        Long userId = resolveActorUserId(saved.getGeneratedBy());
        notificationClient.notifyUser(
                userId,
                saved.getReportID(),
                "KPI report " + saved.getReportID() + " generated and pending review.",
                "Exception"
        );
        // WHY: pending KPI reviews should be actionable via tasks for operations accountability.
        taskClient.createTask(
            userId,
            saved.getReportID(),
            "Review KPI report " + saved.getReportID() + " and approve findings.",
            LocalDateTime.now().toLocalDate()
        );

        return toDTO(saved);
    }

    // ================= GET ALL =================
    @Override
    public List<ReportDTO> getAll() {
        List<Report> entities = repo.findAll();
        if (entities.isEmpty()) {
            throw new ReportNotFoundException("No reports found");
        }
        return entities.stream().map(this::toDTO).toList();
    }

    // ================= GET BY ID =================
    @Override
    public ReportDTO getById(Long id) {
        Report entity = repo.findById(id)
                .orElseThrow(() ->
                        new ReportNotFoundException("Report not found with id: " + id)
                );
        return toDTO(entity);
    }

    // ================= UPDATE =================
    @Override
    public ReportDTO update(Long id, ReportDTO reportDTO) {
        Report existing = repo.findById(id)
                .orElseThrow(() ->
                        new ReportNotFoundException("Report not found with id: " + id)
                );
        existing.setScope(ReportScope.valueOf(reportDTO.getScope()));
        existing.setParametersJSON(reportDTO.getParametersJSON());
        existing.setMetricsJSON(reportDTO.getMetricsJSON());
        existing.setGeneratedBy(reportDTO.getGeneratedBy());
        existing.setGeneratedAt(LocalDateTime.now());
        return toDTO(repo.save(existing));
    }

    // ================= DELETE =================
    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ReportNotFoundException("Report not found with id: " + id);
        }
        repo.deleteById(id);
    }

    private Long parseUserId(String userValue) {
        if (userValue == null || userValue.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(userValue.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Long resolveActorUserId(String userValue) {
        Long parsed = parseUserId(userValue);
        if (parsed != null) {
            return parsed;
        }
        // WHY: generatedBy may be a username, so use authenticated user id for task/notification ownership.
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            HttpServletRequest request = servletAttributes.getRequest();
            Object userId = request.getAttribute("userId");
            if (userId instanceof Long value) {
                return value;
            }
            if (userId instanceof Integer value) {
                return value.longValue();
            }
            if (userId instanceof String value) {
                try {
                    return Long.parseLong(value);
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }
}
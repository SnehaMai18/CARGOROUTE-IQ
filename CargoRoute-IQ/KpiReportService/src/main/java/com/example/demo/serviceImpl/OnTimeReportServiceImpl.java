package com.example.demo.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.OnTimeReportRequestDTO;
import com.example.demo.dto.OnTimeReportResponseDTO;
import com.example.demo.dto.client.BookingClientDTO;
import com.example.demo.dto.client.ProofOfDeliveryClientDTO;
import com.example.demo.dto.client.ProofOfDeliveryResponseClientDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.OnTimeReportService;

@Service
public class OnTimeReportServiceImpl implements OnTimeReportService {

    // ── Eureka service names ─────────────────────────────────────────────────
    private static final String BOOKING_SERVICE  = "http://BOOKING-SERVICE";
    private static final String MANIFEST_SERVICE = "http://MANIFEST-SERVICE";


    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ReportRepo reportRepo;

    // ────────────────────────────────────────────────────────────────────────
    @Override
    public OnTimeReportResponseDTO generateOnTimeReport(OnTimeReportRequestDTO request, String userName, String userRole) {

        LocalDate from = LocalDate.parse(request.getDateFrom());
        LocalDate to   = LocalDate.parse(request.getDateTo());

        // ── 1. Fetch all bookings from BookingService ────────────────────────
        BookingClientDTO[] bookingArray = new BookingClientDTO[0];
        try {
            bookingArray = restTemplate.getForObject(
                    BOOKING_SERVICE + "/cargoRoute/booking/getBookings",
                    BookingClientDTO[].class);
        } catch (Exception e) {
            // If BookingService is unreachable, proceed with empty list
        }

        List<BookingClientDTO> allBookings = bookingArray != null
                ? Arrays.asList(bookingArray)
                : List.of();

        // ── 2. Filter bookings whose deliveryWindowEnd falls within the date range ──
        //    This is correct: report covers bookings *due for delivery* in the period,
        //    not when they were created.
        List<BookingClientDTO> rangedBookings = allBookings.stream()
                .filter(b -> {
                    if (b.getDeliveryWindowEnd() == null) return false;
                    LocalDate d = b.getDeliveryWindowEnd().toLocalDate();
                    return !d.isBefore(from) && !d.isAfter(to);
                })
                .collect(Collectors.toList());

        int totalBookings = rangedBookings.size();

        // ── 3. Build a map bookingID → deliveryWindowEnd ─────────────────────
        Map<Long, LocalDateTime> windowEndMap = rangedBookings.stream()
                .filter(b -> b.getBookingID() != null && b.getDeliveryWindowEnd() != null)
                .collect(Collectors.toMap(
                        BookingClientDTO::getBookingID,
                        BookingClientDTO::getDeliveryWindowEnd,
                        (a, b) -> a));

        // ── 4. Fetch PODs from ManifestService ───────────────────────────────
        //    ManifestService returns List<ProofOfDeliveryResponseDTO> where each
        //    element wraps { proofOfDelivery: {...}, booking: {...} }
        ProofOfDeliveryResponseClientDTO[] podResponseArray = new ProofOfDeliveryResponseClientDTO[0];
        try {
            podResponseArray = restTemplate.getForObject(
                    MANIFEST_SERVICE + "/cargoRoute/proof-of-delivery/getAllProofOfDeliveries",
                    ProofOfDeliveryResponseClientDTO[].class);
        } catch (Exception e) {
            // If ManifestService is unreachable, no PODs to match
        }

        // Unwrap the inner proofOfDelivery from each response wrapper
        List<ProofOfDeliveryClientDTO> allPods = podResponseArray != null
                ? Arrays.stream(podResponseArray)
                        .filter(r -> r != null && r.getProofOfDelivery() != null)
                        .map(ProofOfDeliveryResponseClientDTO::getProofOfDelivery)
                        .collect(Collectors.toList())
                : List.of();

        // ── 5. Calculate on-time bookings ────────────────────────────────────
        //    A booking is ON-TIME if POD.deliveredAt <= Booking.deliveryWindowEnd
        long onTimeCount = allPods.stream()
                .filter(pod -> {
                    if (pod.getBookingID() == null || pod.getDeliveredAt() == null) return false;
                    LocalDateTime windowEnd = windowEndMap.get(pod.getBookingID());
                    if (windowEnd == null) return false;
                    return !pod.getDeliveredAt().isAfter(windowEnd);
                })
                .map(ProofOfDeliveryClientDTO::getBookingID)
                .distinct()
                .count();

        int onTimeBookings = (int) onTimeCount;

        // ── 6. Compute on-time percentage ────────────────────────────────────
        String onTimePct = totalBookings > 0
                ? String.format("%.2f%%", (onTimeBookings * 100.0) / totalBookings)
                : "0.00%";

        // ── 7. Build generatedBy from headers (name + role come from JWT via frontend) ──
        String generatedBy;
        if (userName != null && !userName.isBlank()) {
            String role = (userRole != null && !userRole.isBlank()) ? userRole : "User";
            generatedBy = userName + " (" + role + ")";
        } else {
            generatedBy = "Unknown User";
        }

        // ── 8. Build JSON strings ────────────────────────────────────────────
        String parametersJSON = String.format(
                "{\"dateFrom\":\"%s\",\"dateTo\":\"%s\"}",
                request.getDateFrom(), request.getDateTo());

        String metricsJSON = String.format(
                "{\"totalBookings\":%d,\"onTimeBookings\":%d,\"onTimePercentage\":\"%s\"}",
                totalBookings, onTimeBookings, onTimePct);

        // ── 9. Persist Report entity ────────────────────────────────────────
        Report report = new Report();
        report.setScope(ReportScope.ONTIME);
        report.setParametersJSON(parametersJSON);
        report.setMetricsJSON(metricsJSON);
        report.setGeneratedBy(generatedBy);
        report.setGeneratedAt(LocalDateTime.now());

        Report saved = reportRepo.save(report);

        // ── 10. Build and return response ────────────────────────────────────
        OnTimeReportResponseDTO response = new OnTimeReportResponseDTO();
        response.setReportID(saved.getReportID());
        response.setScope(saved.getScope().name());
        response.setParametersJSON(saved.getParametersJSON());
        response.setMetricsJSON(saved.getMetricsJSON());
        response.setGeneratedBy(saved.getGeneratedBy());
        response.setGeneratedAt(saved.getGeneratedAt().toString());
//        response.setTotalBookings(totalBookings);
//        response.setOnTimeBookings(onTimeBookings);
//        response.setOnTimePercentage(onTimePct);

        return response;
    }
}

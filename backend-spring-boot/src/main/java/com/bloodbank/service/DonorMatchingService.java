package com.bloodbank.service;

import java.util.*;

/**
 * Service that implements the Emergency Donor Matching Algorithm
 * based on biological compatibility rules, availability, eligibility status,
 * and geographic proximity.
 */
public class DonorMatchingService {

    private static final Map<String, List<String>> COMPATIBILITY_MAP = Map.of(
        "A+", List.of("A+", "A-", "O+", "O-"),
        "A-", List.of("A-", "O-"),
        "B+", List.of("B+", "B-", "O+", "O-"),
        "B-", List.of("B-", "O-"),
        "AB+", List.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
        "AB-", List.of("AB-", "A-", "B-", "O-"),
        "O+", List.of("O+", "O-"),
        "O-", List.of("O-")
    );

    public static boolean isCompatible(String donorGroup, String recipientGroup) {
        List<String> validDonors = COMPATIBILITY_MAP.get(recipientGroup);
        return validDonors != null && validDonors.contains(donorGroup);
    }
}

package com.spring.teambondbackend.registration.dto;

import lombok.Data;

@Data
public class LeetCodeStatsDto {
    private int totalSolved;
    private int totalQuestions;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private double acceptanceRate;
    private int ranking;
    private String contributionPoints;
    private String reputation;
}

package com.spring.teambondbackend.registration.service;

import com.spring.teambondbackend.registration.dto.LeetCodeStatsDto;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LeetCodeService {

    private final String LEETCODE_API_URL = "https://leetcode.com/graphql";
    private final RestTemplate restTemplate = new RestTemplate();

    public LeetCodeStatsDto getStats(String username) throws Exception {
        String query = "query userProblemsSolved($username: String!) {" +
                "  allQuestionsCount {" +
                "    difficulty" +
                "    count" +
                "  }" +
                "  matchedUser(username: $username) {" +
                "    problemsSolvedBeatenStats {" +
                "      difficulty" +
                "      percentage" +
                "    }" +
                "    submitStatsGlobal {" +
                "      acSubmissionNum {" +
                "        difficulty" +
                "        count" +
                "      }" +
                "    }" +
                "    profile {" +
                "      ranking" +
                "      reputation" +
                "    }" +
                "  }" +
                "}";

        Map<String, Object> variables = new HashMap<>();
        variables.put("username", username);

        Map<String, Object> body = new HashMap<>();
        body.put("query", query);
        body.put("variables", variables);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "Mozilla/5.0");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(LEETCODE_API_URL, entity, String.class);
            JSONObject json = new JSONObject(response.getBody());

            if (json.has("errors")) {
                throw new Exception("User not found or LeetCode API error");
            }

            JSONObject data = json.getJSONObject("data");
            JSONObject matchedUser = data.getJSONObject("matchedUser");
            JSONArray submitStats = matchedUser.getJSONObject("submitStatsGlobal").getJSONArray("acSubmissionNum");
            JSONArray totalStats = data.getJSONArray("allQuestionsCount");

            LeetCodeStatsDto stats = new LeetCodeStatsDto();

            // Total Solved
            for (int i = 0; i < submitStats.length(); i++) {
                JSONObject stat = submitStats.getJSONObject(i);
                String difficulty = stat.getString("difficulty");
                int count = stat.getInt("count");

                if (difficulty.equals("All"))
                    stats.setTotalSolved(count);
                else if (difficulty.equals("Easy"))
                    stats.setEasySolved(count);
                else if (difficulty.equals("Medium"))
                    stats.setMediumSolved(count);
                else if (difficulty.equals("Hard"))
                    stats.setHardSolved(count);
            }

            // Total Questions
            for (int i = 0; i < totalStats.length(); i++) {
                JSONObject stat = totalStats.getJSONObject(i);
                if (stat.getString("difficulty").equals("All")) {
                    stats.setTotalQuestions(stat.getInt("count"));
                    break;
                }
            }

            stats.setRanking(matchedUser.getJSONObject("profile").getInt("ranking"));
            stats.setReputation(String.valueOf(matchedUser.getJSONObject("profile").getInt("reputation")));

            // Acceptance Rate Calculation (Roughly from Solved / Total or similar if
            // available)
            if (stats.getTotalQuestions() > 0) {
                stats.setAcceptanceRate(
                        Math.round((double) stats.getTotalSolved() / stats.getTotalQuestions() * 1000.0) / 10.0);
            }

            return stats;

        } catch (Exception e) {
            throw new Exception("Failed to fetch LeetCode data: " + e.getMessage());
        }
    }
}

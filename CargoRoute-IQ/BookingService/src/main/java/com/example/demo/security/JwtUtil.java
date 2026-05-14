package com.example.demo.security;
 
import io.jsonwebtoken.*;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
 
@Component
public class JwtUtil {
private String secret="secretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkey";
public String generateToken(String username,String role, Long userId){
    return Jwts.builder()
            .setSubject(username)
            .claim("role", role) //adding data to the token
            .claim("userId", userId)  
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis()+1000*60*60*10))
            .signWith(SignatureAlgorithm.HS256,secret)
            .compact();
}
    
    
    
public String extractUsername(String token){
return Jwts.parser()
.setSigningKey(secret)
.parseClaimsJws(token)
.getBody()
.getSubject();
}
 
public String extractRole(String token){
    return Jwts.parser()
        .setSigningKey(secret)
        .parseClaimsJws(token)
        .getBody()
        .get("role", String.class);
}


    /**
     * Extracts the userId claim from the JWT.
     * Returns null if the claim is absent.
     */
    public Long extractUserId(String token) {
        Object val = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody()
                .get("userId");
        if (val == null) return null;
        if (val instanceof Long) return (Long) val;
        return Long.valueOf(val.toString());
    }

    /**
     * Returns the first authority after stripping the "ROLE_" prefix.
     */
    public String extractRole(Authentication authentication) {
        if (authentication == null) return null;
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }
}
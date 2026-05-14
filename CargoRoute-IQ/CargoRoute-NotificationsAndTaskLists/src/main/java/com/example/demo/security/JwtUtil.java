package com.example.demo.security;
 
import io.jsonwebtoken.*;
import java.util.Date;
 
import org.springframework.stereotype.Component;
 
@Component
public class JwtUtil {
private String secret="secretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkeysecretkey";
    public String generateToken(String username,String role, String userId){
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

public Long extractUserId(String token) {
    Object raw = Jwts.parser()
        .setSigningKey(secret)
        .parseClaimsJws(token)
        .getBody()
        .get("userId");
    if (raw == null)        return null;
    if (raw instanceof Long)    return (Long) raw;
    if (raw instanceof Integer) return ((Integer) raw).longValue();
    // IAM may store it as String
    try { return Long.parseLong(raw.toString()); }
    catch (NumberFormatException e) { return null; }
}

}
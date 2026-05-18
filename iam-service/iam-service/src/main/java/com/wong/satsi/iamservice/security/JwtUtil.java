package com.wong.satsi.iamservice.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component // Esta anotación le dice a Spring Boot: "Crea esta herramienta y tenla lista para usarla"
public class JwtUtil {

    // 1. La firma digital secreta. (¡Debe ser larga y compleja!)
    // En el mundo real, esto no se pone en el código, sino en variables de entorno seguras.
    private final String SECRET_KEY = "MiSuperClaveSecretaParaElSistemaDeTicketsSatsi2026";

    // 2. Tiempo de vida del token (Ejemplo: 1 hora en milisegundos)
    private final long EXPIRATION_TIME = 3600000;

    // Método interno para transformar tu texto secreto en una llave criptográfica
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // 3. El método que "Fabrica" el Pase VIP
    public String generarToken(String username, String rol) {
        return Jwts.builder()
                .setSubject(username) // A quién le pertenece el pase
                .claim("rol", rol)    // Guardamos el rol adentro para saber qué permisos darle después
                .setIssuedAt(new Date(System.currentTimeMillis())) // Fecha de emisión: Hoy, ahora.
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Fecha de caducidad
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // El sello de seguridad inquebrantable
                .compact();
    }

    // 4. El método que "Revisa" si un Pase VIP es falso, modificado o si ya caducó
    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true; // Si pasa por aquí sin explotar, el token es 100% válido
        } catch (Exception e) {
            return false; // Si alguien intentó falsificarlo o si ya pasó la hora, lo rechazamos
        }
    }

    // 5. El método para leer a quién le pertenece el pase (sin tener que ir a la Base de Datos)
    public String extraerUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
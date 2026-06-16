package com.wong.satsi.iamservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lee el header "Authorization" de la petición HTTP (donde se espera que venga el token JWT)
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // 2. Si el header tiene un token que empieza con "Bearer ", entonces lo procesamos
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Quitamos la palabra "Bearer " para dejar solo el token
            try {
                username = jwtUtil.extraerUsername(jwt); // Usamos tu fábrica para leer de quién es el token
            } catch (Exception e) {
                System.out.println("Error extrayendo el usuario del token (Token inválido o expirado)");
            }
        }

        // 3. Si el token tiene un usuario válido y el usuario aún no está autenticado en este hilo
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 4. El guardia valida el token para confirmar que no sea falso
            if (jwtUtil.validarToken(jwt)) {

                // 5. Si el token es válido, el guardia le da permiso al usuario para pasar, creando un objeto de autenticación con su username y roles.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, new ArrayList<>());

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 6. Deja que la petición continúe su camino hacia el controlador
        filterChain.doFilter(request, response);
    }
}
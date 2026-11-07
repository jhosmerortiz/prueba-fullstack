
package com.vertex.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JdbcTemplate jdbc) throws Exception {

        AuthorizationManager<RequestAuthorizationContext> soloAdmin =
                (authentication, context) -> {

            var usuario = authentication.get();

            if (!(usuario instanceof JwtAuthenticationToken jwt)) {
                return new AuthorizationDecision(false);
            }

            Boolean esAdmin = jdbc.queryForObject(
                """
                SELECT EXISTS(
                    SELECT 1 FROM public.perfiles
                    WHERE id = CAST(? AS uuid)
                    AND rol = 'admin'
                )
                """,
                Boolean.class,
                jwt.getToken().getSubject()
            );

            return new AuthorizationDecision(
                Boolean.TRUE.equals(esAdmin)
            );
        };

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/productos",
                    "/api/productos/**",
                    "/api/categorias",
                    "/api/categorias/**"
                ).permitAll()
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/productos",
                    "/api/productos/**"
                ).access(soloAdmin)
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/productos",
                    "/api/productos/**"
                ).access(soloAdmin)
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/productos",
                    "/api/productos/**"
                ).access(soloAdmin)
                .anyRequest().denyAll()
            )
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(Customizer.withDefaults())
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
            List.of("http://localhost:5173")
        );
        config.setAllowedMethods(
            List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );
        config.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

package com.wong.satsi.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NotificationServiceApplication {

	/**
	 * Punto de entrada de la aplicación Spring Boot.
	 * Inicializa el contexto de Spring y arranca el servidor embebido
	 * para exponer los endpoints definidos en el proyecto.
	 */
	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

}

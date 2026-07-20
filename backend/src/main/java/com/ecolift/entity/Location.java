package com.ecolift.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "locations", uniqueConstraints = {
	    @UniqueConstraint(columnNames = {"latitude", "longitude"})
	})
public class Location {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false, columnDefinition = "TEXT")
	private String address;
	@Column(nullable = false, length = 100)
	private String city;
	@Column(nullable = false, length = 100)
	private String state;
	@Column(nullable = false, precision = 10, scale = 8)
	private BigDecimal latitude;
	@Column(nullable = false, precision = 11, scale = 8)
	private BigDecimal longitude;
}

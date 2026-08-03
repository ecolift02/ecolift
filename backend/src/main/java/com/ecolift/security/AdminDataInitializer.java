package com.ecolift.security;

import com.ecolift.entity.Role;
import com.ecolift.repository.RoleRepository;
import com.ecolift.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Added for the Admin Management Module. Runs two small, idempotent,
 * additive-only steps on startup - nothing here modifies or overwrites any
 * pre-existing data:
 *
 * 1. Ensures an "ADMIN" role row exists. This project has no data.sql/seed
 *    mechanism (DRIVER/PASSENGER are rows that already exist in the
 *    database), and RoleServiceImpl.assignRoleToUser() requires the role
 *    row to already exist, so this makes "ADMIN" grantable the same way.
 *
 * 2. Backfills Vehicle.verificationStatus for vehicles created before this
 *    module existed (that column is new and nullable for exactly this
 *    reason). Vehicles that were already auto-verified keep working
 *    (backfilled as APPROVED); any others are backfilled as PENDING so an
 *    admin can review them. This only touches rows where verificationStatus
 *    is still NULL, so it runs harmlessly on every future startup too.
 */
@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final VehicleRepository vehicleRepository;

    public AdminDataInitializer(RoleRepository roleRepository, VehicleRepository vehicleRepository) {
        this.roleRepository = roleRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            roleRepository.save(adminRole);
        }

        vehicleRepository.backfillApprovedForVerifiedLegacyVehicles();
        vehicleRepository.backfillPendingForUnverifiedLegacyVehicles();
    }
}

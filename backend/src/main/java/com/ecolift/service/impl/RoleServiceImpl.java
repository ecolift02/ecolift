package com.ecolift.service.impl;

import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.repository.RoleRepository;
import com.ecolift.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Role save(Role role) {
        if (roleRepository.findByName(role.getName()).isPresent()) {
            throw new DuplicateResourceException("Role already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }

    @Override
    public Role update(Long id, Role roleDetails) {
        Role role = findById(id);
        role.setName(roleDetails.getName());
        return roleRepository.save(role);
    }

    @Override
    public void delete(Long id) {
        Role role = findById(id);
        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return roleRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return roleRepository.count();
    }

    @Override
    public Role createRole(String roleName) {
        Role role = new Role();
        role.setName(roleName);
        return save(role);
    }

    @Override
    public void assignRoleToUser(User user, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.getRoles().add(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return findAll();
    }
}
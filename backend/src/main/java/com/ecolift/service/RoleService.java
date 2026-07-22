package com.ecolift.service;

import java.util.List;

import com.ecolift.entity.Role;
import com.ecolift.entity.User;

public interface RoleService {
    Role save(Role role);
    Role update(Long id, Role role);
    void delete(Long id);
    Role findById(Long id);
    List<Role> findAll();
    boolean exists(Long id);
    long count();
    
    Role createRole(String roleName);
    void assignRoleToUser(User user, String roleName);
    List<Role> getAllRoles();
}
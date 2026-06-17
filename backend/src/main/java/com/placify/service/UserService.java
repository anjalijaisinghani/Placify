package com.placify.service;

import java.util.List;

import com.placify.dto.user.UserRequest;
import com.placify.dto.user.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId);

    UserResponse updateUser(Long userId, UserRequest request);

    void deleteUser(Long userId);
}

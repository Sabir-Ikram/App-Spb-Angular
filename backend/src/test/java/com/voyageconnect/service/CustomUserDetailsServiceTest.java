package com.voyageconnect.service;

import com.voyageconnect.model.Role;
import com.voyageconnect.model.User;
import com.voyageconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loadUserByUsername_found() {
        User u = User.builder().id(1L).email("alice@example.com").password("pwd").role(Role.USER).build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(u));

        UserDetails details = service.loadUserByUsername("alice@example.com");
        assertNotNull(details);
        assertEquals("alice@example.com", details.getUsername());
        assertTrue(details.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("USER")));
    }

    @Test
    void loadUserByUsername_notFound() {
        when(userRepository.findByEmail("nope@example.com")).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("nope@example.com"));
    }
}

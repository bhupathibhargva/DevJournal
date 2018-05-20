package com.dev.journal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dev.journal.dao.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

}
package com.dev.journal.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.journal.dao.Journal;
import com.dev.journal.dao.Tags;

@RestController
public class DevJournalController {

	@PostMapping
	@RequestMapping("/journal/add")
	public void addJournal(@RequestBody Journal journal) {
		System.err.println("line 1");
		Journal jour = new Journal(journal.getId(), journal.getName(),
				journal.getContent(), journal.getTags());
		List<Journal> journalList = new ArrayList<>();
		journalList.add(jour);
		System.err.println(journalList.size());
		System.err.println(journalList.get(0).getName());
	}

	@GetMapping
	@RequestMapping("/journal")
	public ResponseEntity<List<Journal>> getJournal() {
		Tags tag = new Tags();
		tag.setId(1l);
		tag.setTags("Spring");
		List<Tags> tagsList = new ArrayList<>();
		tagsList.add(tag);

		Journal jour = new Journal(11, "spring", "its awesome", tagsList);
		Journal jour1 = new Journal(12, "Java", "it is also awesome", tagsList);
		List<Journal> journalList = new ArrayList<>();
		journalList.add(jour);
		journalList.add(jour1);
		System.err.println(journalList.size());
		System.err.println(journalList.get(0).getName());

		return new ResponseEntity<>(journalList, HttpStatus.OK);
	}
}
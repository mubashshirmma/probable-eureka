import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { sampleNotes } from '../data/sampleData';
import { useStudySet } from '../context/StudySetContext';
import { generateStudySet } from '../api/generateStudySet';

export default function CreateSetPage() {
  const navigate = useNavigate();
  const pdfInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const isSubmittingRef = useRef(false); // blocks double submits before React re-renders
  const { setStudySet } = useStudySet();

  const [topicTitle, setTopicTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of { id, file, type: 'pdf' | 'image', name, size, rawSize, previewUrl }
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedOutputs, setSelectedOutputs] = useState({
    summary: true,
    flashcards: true,
    quiz: true,
  });

  const MAX_FILES = 5;
  const MAX_PHOTOS = 3; // the AI's vision model reads at most 3 images per request
  const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

  const pdfCount = selectedFiles.filter((f) => f.type === 'pdf').length;
  const photoCount = selectedFiles.filter((f) => f.type === 'image').length;
  const isMaxFilesReached = selectedFiles.length >= MAX_FILES;

  const currentTotalBytes = selectedFiles.reduce((acc, f) => acc + f.rawSize, 0);
  const currentTotalMB = (currentTotalBytes / (1024 * 1024)).toFixed(1);

  const handleUseSampleNotes = () => {
    setNotes(sampleNotes);
    setTopicTitle('Number System - CBSE Class 9 Maths');
    setErrorMessage('');
  };

  const handleClearText = () => {
    setNotes('');
  };

  const isPdfFile = (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
  const isSupportedPhoto = (f) => SUPPORTED_PHOTO_TYPES.includes(f.type);

  // Validate and add incoming files. `items` is [{ file, type: 'pdf' | 'image' }];
  // everything is checked together against the type, count and size limits.
  const addItems = (items) => {
    if (!items || items.length === 0) return;

    // 1. Format validation
    for (const { file: f, type } of items) {
      if (type === 'pdf' && !isPdfFile(f)) {
        setErrorMessage('Only PDF files are allowed here.');
        return;
      }
      if (type === 'image' && !isSupportedPhoto(f)) {
        setErrorMessage('Only JPG, PNG or WebP photos are allowed here.');
        return;
      }
    }

    // 2. Filter out duplicates (same name and size)
    const fresh = items.filter(
      ({ file: n }) => !selectedFiles.some((existing) => existing.name === n.name && existing.rawSize === n.size)
    );
    if (fresh.length === 0) {
      setErrorMessage('This file has already been added.');
      return;
    }

    // 3a. The AI reads at most 3 photos per request
    const newPhotos = fresh.filter((i) => i.type === 'image').length;
    if (photoCount + newPhotos > MAX_PHOTOS) {
      setErrorMessage('You can add up to 3 photos at a time.');
      return;
    }

    // 3. Check file count limit (maximum 5 files)
    if (selectedFiles.length + fresh.length > MAX_FILES) {
      setErrorMessage('You can add a maximum of 5 files.');
      return;
    }

    // 4. Check total combined size limit (10 MB)
    const newBytes = fresh.reduce((sum, i) => sum + i.file.size, 0);
    if (currentTotalBytes + newBytes > MAX_TOTAL_SIZE) {
      setErrorMessage('Total size cannot be more than 10 MB.');
      return;
    }

    // Add new valid files to existing selectedFiles list
    const newItems = fresh.map(({ file, type }) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      type,
      name: file.name,
      rawSize: file.size,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      previewUrl: type === 'image' ? URL.createObjectURL(file) : null,
    }));

    setSelectedFiles((prev) => [...prev, ...newItems]);
    setErrorMessage('');
  };

  const handleAddFiles = (fileList, type) =>
    addItems(Array.from(fileList || []).map((file) => ({ file, type })));

  // Drag and drop: PDFs and photos can be dropped together on the upload zone.
  const handleDragOver = (event) => {
    if (isGenerating || isMaxFilesReached) return;
    event.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragOver(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (isGenerating) return;
    const dropped = Array.from(event.dataTransfer?.files || []);
    if (dropped.length === 0) return;
    if (isMaxFilesReached) {
      setErrorMessage('You can add a maximum of 5 files.');
      return;
    }
    const items = [];
    for (const f of dropped) {
      if (isPdfFile(f)) items.push({ file: f, type: 'pdf' });
      else if (isSupportedPhoto(f)) items.push({ file: f, type: 'image' });
      else {
        setErrorMessage('Only PDF, JPG, PNG or WebP files can be added here.');
        return;
      }
    }
    addItems(items);
  };

  const handlePdfUpload = (e) => {
    handleAddFiles(e.target.files, 'pdf');
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handlePhotoUpload = (e) => {
    handleAddFiles(e.target.files, 'image');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => {
      const itemToRemove = prev.find((f) => f.id === id);
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setErrorMessage('');
  };

  const toggleOutput = (key) => {
    setSelectedOutputs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerate = async () => {
    if (isSubmittingRef.current) return;

    const hasText = notes.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;

    if (!hasText && !hasFiles) {
      setErrorMessage('Please add some notes, a PDF or a photo to continue.');
      return;
    }
    if (selectedFiles.length > MAX_FILES || currentTotalBytes > MAX_TOTAL_SIZE) {
      setErrorMessage('Please keep to 5 files and 10 MB in total.');
      return;
    }

    isSubmittingRef.current = true;
    setErrorMessage('');
    setIsGenerating(true);

    try {
      const studySet = await generateStudySet({
        text: notes,
        title: topicTitle.trim(),
        files: selectedFiles.map((f) => f.file),
      });
      setStudySet(studySet, 'ai');
      navigate('/results');
    } catch (err) {
      // Stay on this page and keep the student's input so they can retry.
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setIsGenerating(false);
    }
  };

  return (
    <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar subtitle="Create Set" />

      {/* Hidden File Inputs with multiple attribute */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handlePdfUpload}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <main className="flex-1 flex flex-col relative w-full pt-24 sm:pt-28 pb-32 md:pb-16">
        <div className="w-full px-4 sm:px-6 flex flex-col gap-6 max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-space-xs rise">
            <div className="flex items-center gap-space-xs">
              <span className="neu-icon neu-icon--round !w-7 !h-7">
                <span className="material-symbols-outlined text-[16px]">magic_button</span>
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-bold tracking-wider uppercase">
                AI Study Generator
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
              Create Your Study Set
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Type or paste notes, upload textbook PDFs, or snap photos of your notebook.
            </p>
          </div>

          {/* Loading State Overlay / Card */}
          {isGenerating ? (
            <Card className="flex flex-col gap-space-md max-w-2xl w-full mx-auto" role="status" aria-live="polite" aria-busy="true">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="neu-icon neu-icon--round neu-icon--lg">
                    <span className="material-symbols-outlined text-[22px] animate-pulse">
                      psychology
                    </span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                      Active Analysis
                    </span>
                    <h2 className="font-title-md text-title-md text-primary font-bold">
                      AI Saathi is analyzing your material...
                    </h2>
                  </div>
                </div>
                <span className="pill pill--accent px-2.5 py-1 font-label-sm text-label-sm font-semibold">
                  Processing
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="progress-track">
                  <div className="progress-fill progress-fill--indeterminate"></div>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
                  <span>Generating Study Module...</span>
                  <span className="font-semibold text-secondary">Fast Engine Active</span>
                </div>
              </div>

              {/* Step-by-Step Progress Pipeline */}
              <div className="neu-well p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[18px] text-secondary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="font-label-md text-label-md">1. Parsing definitions & identities</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Completed</span>
                </div>

                <div className="flex items-center justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary animate-spin">
                      progress_activity
                    </span>
                    <span className="font-label-md text-label-md font-bold">
                      2. Crafting active recall flashcards
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    In Progress...
                  </span>
                </div>

                <div className="flex items-center justify-between text-outline">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
                    <span className="font-label-md text-label-md">3. Assembling 10 practice MCQs</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Queued</span>
                </div>
              </div>
            </Card>
          ) : (
            /* Main Input Form: your material on the left, upload and generate on the right */
            <div className="grid lg:grid-cols-2 gap-5 lg:gap-6 items-start">
            <Card className="flex flex-col gap-space-md rise" style={{ '--i': 1 }}>
              {/* Topic Title Input */}
              <div className="flex flex-col gap-space-xs">
                <label
                  className="font-label-md text-label-md text-on-surface flex items-center justify-between font-semibold"
                  htmlFor="topic-title"
                >
                  <span>Topic Title</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                    Optional
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none" aria-hidden="true">
                    bookmark
                  </span>
                  <input
                    id="topic-title"
                    type="text"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    maxLength={200}
                    disabled={isGenerating}
                    placeholder="e.g., Number System - CBSE Class 9 Maths"
                    className="neu-input pl-11 pr-4 py-3 font-body-md text-body-md"
                  />
                </div>
              </div>

              {/* Input Method 1: Notes Textarea */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5"
                    htmlFor="study-notes"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      edit_note
                    </span>
                    <span>1. Type or Paste Notes</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {notes.length} / 5,000 characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="study-notes"
                    rows={5}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Type or paste concepts, formulas, or chapter summaries..."
                    className="neu-input p-4 font-body-md text-body-md resize-y min-h-[9rem] lg:min-h-[15rem] leading-relaxed"
                  />
                </div>

                {/* Quick actions for text */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleUseSampleNotes}
                    className="neu-chip px-4 py-2 min-h-[40px] text-primary font-label-md text-label-md font-semibold"
                  >
                    <span className="material-symbols-outlined text-[17px] text-secondary">
                      history_edu
                    </span>
                    <span>Use Sample Notes</span>
                  </button>

                  {notes && (
                    <button
                      type="button"
                      onClick={handleClearText}
                      className="font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors px-3 py-1 min-h-[40px] inline-flex items-center rounded-full"
                    >
                      Clear Text
                    </button>
                  )}
                </div>
              </div>

            </Card>

            <Card className="flex flex-col gap-space-md rise" style={{ '--i': 2 }}>
              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-outline/15"></div>
                <span className="flex-shrink mx-3 text-on-surface-variant font-label-sm text-label-sm uppercase font-semibold">
                  Upload Files (Up to 5)
                </span>
                <div className="flex-grow border-t border-outline/15"></div>
              </div>

              {/* Input Methods 2 & 3: Upload Buttons with Dynamic States & Badges */}
              <div
                className={`dropzone p-4 flex flex-col gap-4 ${isDragOver ? 'is-dragover' : ''} ${isMaxFilesReached ? 'is-disabled' : ''}`}
                onDragEnter={handleDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="Drop files here"
              >
                <div className="flex flex-col items-center text-center gap-1.5 pt-1">
                  <span className="neu-icon neu-icon--lg !text-secondary">
                    <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                      {isDragOver ? 'file_download' : 'cloud_upload'}
                    </span>
                  </span>
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {isDragOver ? 'Drop to add your files' : (<><span className="sm:hidden">Add your files</span><span className="hidden sm:inline">Drag and drop files here</span></>)}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    PDFs, JPG, PNG or WebP. Up to 5 files, 10 MB in total.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                {/* Method 2: Upload PDF */}
                <button
                  type="button"
                  disabled={isMaxFilesReached}
                  onClick={() => {
                    if (!isMaxFilesReached) pdfInputRef.current?.click();
                  }}
                  className="neu-btn min-h-[64px] px-4 py-3 rounded-2xl flex items-center justify-center gap-3 text-primary group"
                >
                  <div className="neu-icon neu-icon--sm !text-error relative group-hover:scale-105">
                    <span className="material-symbols-outlined text-[20px]">
                      {pdfCount > 0 ? 'add' : 'picture_as_pdf'}
                    </span>
                    {pdfCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-error text-white font-label-sm text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {pdfCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md font-bold">
                      {pdfCount > 0 ? 'Add another PDF' : 'Upload PDF'}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {pdfCount > 0
                        ? `${pdfCount} PDF${pdfCount > 1 ? 's' : ''} added`
                        : 'Select .pdf files'}
                    </span>
                  </div>
                </button>

                {/* Method 3: Upload Photo of Notes */}
                <button
                  type="button"
                  disabled={isMaxFilesReached}
                  onClick={() => {
                    if (!isMaxFilesReached) photoInputRef.current?.click();
                  }}
                  className="neu-btn min-h-[64px] px-4 py-3 rounded-2xl flex items-center justify-center gap-3 text-primary group"
                >
                  <div className="neu-icon neu-icon--sm relative group-hover:scale-105">
                    <span className="material-symbols-outlined text-[20px]">
                      {photoCount > 0 ? 'add' : 'photo_camera'}
                    </span>
                    {photoCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-secondary text-white font-label-sm text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {photoCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-label-md text-label-md font-bold">
                      {photoCount > 0 ? 'Add another photo' : 'Upload Photo'}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {photoCount > 0
                        ? `${photoCount} photo${photoCount > 1 ? 's' : ''} added`
                        : 'Camera or Gallery'}
                    </span>
                  </div>
                </button>
              </div>
              </div>

              {/* Maximum Files Reached Notification */}
              {isMaxFilesReached && (
                <div className="glass-panel p-2 text-on-surface-variant text-center font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-outline">lock</span>
                  <span>Maximum files reached.</span>
                </div>
              )}

              {/* Files Counter & Summary Status Bar */}
              {selectedFiles.length > 0 && (
                <div className="flex items-center justify-between px-1 text-on-surface-variant font-label-sm text-label-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>
                      {selectedFiles.length} of {MAX_FILES} files
                    </span>
                  </span>
                  <span>Total: {currentTotalMB} MB of 10 MB</span>
                </div>
              )}

              {/* Uploaded Files List (One Below Another) */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  {selectedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="glass glass--soft !rounded-2xl p-2.5 flex items-center justify-between gap-space-sm transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-space-sm min-w-0">
                        {item.type === 'image' && item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt="Preview"
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="neu-icon !text-error">
                            <span className="material-symbols-outlined text-[20px]">
                              picture_as_pdf
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md font-bold text-primary truncate">
                            {item.name}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {item.type === 'pdf' ? 'PDF' : 'Photo'} • {item.size}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id)}
                        className="neu-icon neu-icon--round neu-icon--sm !text-on-surface-variant hover:!text-error"
                        title="Remove file"
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Information Note in Clean English */}
              <div className="glass-panel p-3 flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                <span
                  className="material-symbols-outlined text-[18px] text-secondary shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  info
                </span>
                <span className="leading-snug">
                  Your notes, PDFs and photos are sent to the AI to build your study set. This can take up to a minute.
                </span>
              </div>

              {/* Friendly Error Message */}
              {errorMessage && (
                <div role="alert" className="p-3 rounded-xl bg-error-container text-on-error-container flex items-center gap-2 text-label-md font-medium shadow-sm">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Generation Options Toggle Chips */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                  Output Assets to Generate
                </span>
                <div className="flex flex-wrap gap-space-sm" role="group" aria-label="Output assets to generate">
                  <button
                    type="button"
                    aria-pressed={selectedOutputs.summary}
                    onClick={() => toggleOutput('summary')}
                    className="neu-chip px-4 py-2 min-h-[40px] font-label-md text-label-md font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {selectedOutputs.summary ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>Summary</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={selectedOutputs.flashcards}
                    onClick={() => toggleOutput('flashcards')}
                    className="neu-chip px-4 py-2 min-h-[40px] font-label-md text-label-md font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {selectedOutputs.flashcards ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>8 Flashcards</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={selectedOutputs.quiz}
                    onClick={() => toggleOutput('quiz')}
                    className="neu-chip px-4 py-2 min-h-[40px] font-label-md text-label-md font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {selectedOutputs.quiz ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>10-Question Quiz</span>
                  </button>
                </div>
              </div>

              {/* Primary Action CTA */}
              <Button
                variant="primary"
                size="lg"
                icon="auto_awesome"
                className="w-full mt-space-xs"
                onClick={handleGenerate}
                loading={isGenerating}
              >
                Generate Study Materials
              </Button>

              {/* Trust Meta Info */}
              <div className="flex items-center justify-center gap-space-xs text-on-surface-variant pt-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified_user
                </span>
                <span className="font-label-sm text-label-sm">
                  Curated for NCERT & CBSE Pattern 2024-25
                </span>
              </div>
            </Card>
            </div>
          )}
        </div>
      </main>

      <Sidebar />
    </div>
  );
}

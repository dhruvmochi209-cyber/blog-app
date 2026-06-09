# Engineering Blogging Platform - Technical Architecture & PRD

## Overview
A world-class, multi-user engineering blogging platform built with Next.js 14, Node.js, and MongoDB. Designed for performance, SEO, and premium developer UX.

## Core Features
1.  **Public Feed**: SEO-optimized blog system with infinite scroll, categories, and reading time.
2.  **Rich Editor**: TipTap-based editor with code highlighting and auto-save.
3.  **Creator Dashboard**: Analytics, article management, and publishing controls.
4.  **Auth System**: Role-based (Visitor/Creator) with JWT, Google/GitHub OAuth, and OTP.
5.  **PDF Export**: Professional article exports using @react-pdf/renderer.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query.
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT.
- **Tools**: Cloudinary (Images), Lucide (Icons), Zod (Validation).

## Technical Requirements
- **SEO**: Dynamic metadata, OpenGraph, Structured Data (JSON-LD).
- **Security**: Rate limiting, Helmet, CSRF protection, HTTP-only cookies.
- **UX**: Skeleton screens, cinematic transitions, glassmorphism.

## Folder Structure
- `frontend/src/app`: App Router groups `(feed)`, `(auth)`, `(creator-space)`.
- `backend/src`: MVC + Service Layer architecture.

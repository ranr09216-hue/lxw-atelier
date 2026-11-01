---
name: LXW Atelier
description: A dawn studio wardrobe
colors:
  ivory: "#f6f3ed"
  studio: "#eee8e1"
  peach: "#edcfc0"
  ink: "#253331"
  muted: "#626661"
  line: "rgba(37,51,49,.2)"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(44px,5.3vw,80px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-.045em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(36px,4vw,58px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-.045em"
  body:
    fontFamily: "'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
rounded:
  round: "50%"
spacing:
  control-y: "12px"
  control-x: "26px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    padding: "12px 26px"
  button-round:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    width: "46px"
    height: "46px"
---

# Design System: LXW Atelier

## Overview

**Creative North Star: "Dawn studio"**

The wardrobe is the primary experience: generous ivory space, peach studio light, a silver clothing rail and real garment models. Editorial serif headlines pair with a quiet sans-serif interface. No glass, purple, video, stock imagery or invented product claims.

## Colors

Ivory grounds the page; studio and peach form the softly lit garment stage. Ink carries text and primary actions, muted ink carries supporting copy, and translucent ink draws dividers.

## Typography

Georgia display headings pair with Helvetica Neue and Arial body text. Mixed-case display headings use fluid sizes and tight tracking. On phones the main heading uses `clamp(41px,10vw,62px)`. Product titles use a compact serif treatment (25px desktop, 21px phone) with a 1.2 line-height.

## Layout

The main content caps at 1600px with percentage-based page gutters. At 650px and below the introduction and ordering section stack, and the studio expands to the viewport width. Controls provide at least 44px targets.

## Elevation & Depth

The garment scene provides the primary depth. Interface surfaces remain flat, with a restrained ambient shadow on the fixed contact control. Peach radial light blends into the studio ground.

## Shapes

Flat rectangular primary actions pair with circular scene and contact controls. Thin translucent ink rules separate content; garment selectors use an underline to signal selection.

## Components

Primary actions use ink with ivory text. Round controls gain peach on hover; text actions use an underline. Keyboard focus uses a visible ink outline (2px, offset 5px).

The scene slides, then lifts the selected garment forward for unrestricted yaw with limited pitch. Buttons and keyboard provide gesture alternatives. Reduced motion uses immediate state transitions, disables sway/inertia and stops the marquee. Motion can also be paused explicitly.

## Do's and Don'ts

- Do keep the garment scene primary and supporting interface quiet.
- Do provide gesture alternatives and visible keyboard focus.
- Don't add glass, purple, video, stock imagery or invented product claims.

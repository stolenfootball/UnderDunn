---
title: "Windows Drivers Series Part 1 - Overview"
date: 2025-07-14T19:07:00-05:00
description: "Introduction to the Windows driver exploitation series — who it's for, what tools you'll need, and why drivers are a great target."
draft: false
tags:
  - pwn
  - rev
  - windows
  - drivers
series: "windows-drivers"
order: 1
---

## What is this?
During the last semester of my master's degree at UMass Amherst, I was fortunate enough to take an exploit development class taught by Lurene Grenier.  I had previous experience in CTF style pwn, but this class pushed us all to move past CTF challenges to real world targets as fast as possible.  Although CTFs are great for learning the basics, their contrived nature means the skills they impart don't always translate to hacking on real software, which was the goal of the class.

The final project was to develop a 0 day (or code out an n day) on any target we wanted.  Due to my background in forensics I had a good grasp of Windows internals, so I decided to focus on Windows drivers, expanding upon a previous research project using minifilter drivers as an EDR bypass method. 

Although it quickly became apparent my chosen project was more complex than I had bargained on, after several months of banging my head against the wall (I wish I could say figuratively), I found myself starting to notice small bugs in the drivers I was looking at.

In order to preserve this knowledge, both for myself and others, I decided to make a series of posts outlining the concepts that took me the longest to understand.  This should serve as a good introductory primer for individuals looking to break into the world of Windows kernel exploit development, although obviously A LOT of work will be needed before you start finding bugs.

## Why Windows Drivers?
Windows drivers are an excellent place to start for people who want to begin working in the Windows kernel.  The APIs are complex and contain a lot of "foot guns", and many times direct modification of memory structures is required to achieve a desired result.  It takes many hours of study and a deep familiarity with both the internals of the kernel as well as the driver's memory space to write secure code.  As anyone who has worked in software development before will tell you, those are incredible rare traits to find in a developer, which means buggy driver code is abundent.

That said, if you want to find these bugs, you will need the same deep familiarity with both the internals of the kernel as well as the driver's memory space.  This is not a small amount of knowledge, and will take a while to come up to speed on.

If you can put in the time however, because of the high barrier to entry, there are a lot of bugs in driver code and far too few knowledgable people looking for them.  If you know your stuff, you'll be able to find zero days that give direct access to kernel memory without even needing to triage crashes from a fuzzer.

## Who can benefit from this?
I make the assumption throughout this series that the reader is familiar with the following:

- x86 and x64 assembly code
- C / C++ programming
- Basic ability to exploit memory corruption bugs
- Basic ability to reverse engineer in IDA
- Able to read and understand technical documentation

In other words, this is targeted at a beginner to medium level CTF player who is looking to move to a real target.  If that does not sound like you, I recommend starting with [the UMass CS367 class](https://www.youtube.com/playlist?list=PLkb4u_mRrLEIZPZ5Dp_lVLoolWeCL_G7R), all lectures of which are freely available on YouTube. Once you feel comfortable with those concepts, you should play through some levels of https://pwn.college and get familiar with writing exploit code.

If you find yourself enjoying the challenges, start signing up for CTFs on https://ctftime.org.  Once you can reliably clear easy challenges in the "pwn" category, you are ready for this series.

## What tools will we use?

All examples and reverse engineering in this series will be done in [the free version of IDA](https://hex-rays.com/ida-free).  For the Ghidra / Binja fans out there - IDA is *significantly* better at identifying Windows functions, and the symbols library is much bigger.  It is possible to do this with another decompiler, but your life will be a lot harder.

Dynamic instrumentation will be done with [WinDbg](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/) and [VMware Workstation Pro](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion).  Again, this can be done with other tools, but these are the easiest and most fully featured ones available.  There will be a post later on setting up and using a kernel debugger.

Exploit code will be written in C++ in [Visual Studio Code](https://code.visualstudio.com/) and compiled with the Visual Studio 2022 Development Console.  Driver code will be written and compiled in full [Visual Studio](https://visualstudio.microsoft.com/downloads/), however I'd recommend installing that later during the appropriate post as there are some custom options that are necessary.

## What other resources are out there?

- [Windows Kernel Programming by Pavel Yosifovich](https://www.amazon.com/Windows-Kernel-Programming-Pavel-Yosifovich/dp/B0BW2X91L2) - This is the best book out there for understanding Windows drivers and the kernel API. Explains the concepts in an easy to understand way and provides TONS of examples.  A must have if you are planning on developing Windows exploits as more than just a hobby.
- [Windows Hardware Developer Documentation](https://learn.microsoft.com/en-us/windows-hardware/drivers/) - Your new best friend. I will refer to this as a source of truth throughout the posts.  Contains information about nearly every documented Windows API function stored in an easy to search and read way.
- [UMass Amherst CS367](https://www.youtube.com/playlist?list=PLkb4u_mRrLEIZPZ5Dp_lVLoolWeCL_G7R) - Freely available lectures covering general exploit development topics. This is an excellent place to start with exploit development, and will only be getting more content as time goes on.
- [pwn.college](https://pwn.college/) - Cybersecurity learning platform by Arizona State University. Fantastic first place to learn pwn, and a favorite of many people from around the world.


import React, { useEffect, useRef, useMemo,useState } from "react";
import "../../../css/KidsQuestionnaire2.css";
import { Trans } from "react-i18next";

const ScaleDisplay = ({
  answers = [],
   groupedAnswers = {},
  onAnswerRemove,
  onAnswerDrop,
  totalEnergy = 0,
  isAnimating = false,
  currentQuestion,
  canDeleteAnswer,
  solarPanelCount = 0,
  individualEnergies = {}
}) => {
  const svgRef = useRef(null);
  const beamRef = useRef(null);
  const leftBowlRef = useRef(null);
  const rightBowlRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

    // ADD STATE FOR HOVERED ANSWER
      const [hoveredAnswer, setHoveredAnswer] = useState(null);
      const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [hoverTransform, setHoverTransform] = useState({ x: 0, y: 0, scale: 1 });

  const palette = [
    "#0d6efd", "#198754", "#dc3545",
    "#ffc107", "#0dcaf0", "#6c757d", "#212529",
  ];


  // SIMPLIFIED Physics state
  const S = useRef({
    leftMass: 0,
    rightMass: 0,
    angle: 0,
    angVel: 0,
    leftDip: 0,
    rightDip: 0,
    leftDipVel: 0,
    rightDipVel: 0,
    currentPanels: 0,
  });

  //console.log("=== SCALE RENDER ===");
  //console.log("totalEnergy:", totalEnergy, "solarPanelCount:", solarPanelCount);
  //console.log("answers count:", answers.length);

  // SLOWER Physics constants
  const C = useMemo(() => ({
    pivot: { x: 550, y: 200 },
    halfLen: 286,
    maxAngle: 45,
    accelK: 0.00005, // Reduced from 0.08 for much slower movement
    damping: 0.008, // Reduced from 0.15 for less damping (slower stops)
    kAngle: 0.15, // Reduced from 0.03 for much gentler angle changes

    // Bowl dip - make much slower
    dipImpulsePx: 8, // Reduced from 20 for gentler dips
    dipStiffness: 0.04, // Reduced from 0.08 for slower spring
    dipDamping: 0.4, // Reduced from 0.12 for smoother damping

    RIM_Y: -70,
    RIM_W: 220,
    GRID_MARGIN: 8,

    // Answer tiles
    TILE_W: 60,
    TILE_H: 50,
    TILE_RX: 6,
    TILE_GAP: 4,

    // Solar panels
    PANEL_UNIT: 10,
    PANEL_W: 28,
    PANEL_H: 18,
    PANEL_RX: 3,
    PANEL_GAP: 4,

    ENERGY_TO_ANGLE_MULTIPLIER: 7.0, // Reduced from 2.5 for less extreme angles
  }), []);


useEffect(() => {
  const timer = setTimeout(() => {
    // Update left mass based on solarPanelCount after delay
    S.current.leftMass = solarPanelCount * C.PANEL_UNIT * C.ENERGY_TO_ANGLE_MULTIPLIER;
  }, 1500); // 1.5 second delay before solar panels affect balance

  return () => clearTimeout(timer);
}, [solarPanelCount]);


const getAnswerEnergy = (answer) => {
  const energy = individualEnergies[answer.id];

  // If energy is undefined or null, try to calculate a default
  if (energy === undefined || energy === null) {
    // For answers without variables, use a small default value
    // For answers with variables, use 0 (should be set by user)
    const defaultEnergy = (!answer.variables || answer.variables.length === 0) ? 1 : 0;
   // console.log(`⚡ Using default energy ${defaultEnergy} for answer ${answer.id} (${answer.name})`);
    return defaultEnergy;
  }

 // console.log(`🔍 getAnswerEnergy for answer ${answer.id} (${answer.name}):`, energy);
  return energy;
};


  // MAIN EFFECT: Handle solar panel changes - FIXED VERSION
    const massTweens = useRef({
      left: { target: 0, current: 0, speed: 0.05 },
      right: { target: 0, current: 0, speed: 0.05 }
    });

    // FIXED: Handle solar panel changes with gradual mass transition
 useEffect(() => {
 const timer = setTimeout(() => {
    //console.log("🔵 SOLAR PANEL EFFECT: solarPanelCount =", solarPanelCount);
    const targetLeftMass = solarPanelCount * C.PANEL_UNIT * C.ENERGY_TO_ANGLE_MULTIPLIER;
    //console.log("🔵 Setting left mass target:", targetLeftMass);
    massTweens.current.left.target = targetLeftMass;

    const panelDifference = solarPanelCount - S.current.currentPanels;
    //console.log("🔵 Panel difference:", panelDifference, "currentPanels:", S.current.currentPanels);

    if (panelDifference > 0) {
      addPanels(panelDifference);
    } else if (panelDifference < 0) {
      removePanels(Math.abs(panelDifference));
    }
     }, 1500);
  }, [solarPanelCount, C.PANEL_UNIT, C.ENERGY_TO_ANGLE_MULTIPLIER]);


useEffect(() => {
  // Initial sync - clear any existing panels and set to correct count
  if (leftContentRef.current) {
    leftContentRef.current.innerHTML = "";
    S.current.currentPanels = 0;

    // Add correct number of panels
    if (solarPanelCount > 0) {
      addPanels(solarPanelCount);
    }
  }
}, [currentQuestion]); // Reset when question changes

// ADD THIS: Cleanup on unmount
useEffect(() => {
  return () => {
    // Reset state when component unmounts
    S.current.currentPanels = 0;
  };
}, []);

  // FIXED: Handle answers and energy changes with gradual mass transition
   useEffect(() => {
      const amplifiedEnergy = totalEnergy * C.ENERGY_TO_ANGLE_MULTIPLIER;
      //console.log("🔴 ANSWER EFFECT: totalEnergy =", totalEnergy, "amplifiedEnergy =", amplifiedEnergy);
      //console.log("🔴 Answers:", answers);

      massTweens.current.right.target = amplifiedEnergy;
      //console.log("🔴 Setting right mass target:", amplifiedEnergy);

      rebuildAnswerTiles();

      if (answers.length > 0) {
        S.current.rightDipVel += C.dipImpulsePx;
        //console.log("🔴 Added dip impulse, rightDipVel:", S.current.rightDipVel);
      }
    }, [answers, totalEnergy, C.ENERGY_TO_ANGLE_MULTIPLIER, C.dipImpulsePx]);


  // EFFECT: Handle question changes - only reset answers, not panels
  useEffect(() => {
    //console.log(`Question changed to: ${currentQuestion}`);
    rebuildAnswerTiles();
  }, [currentQuestion, answers]);

  // PANEL MANAGEMENT FUNCTIONS

// ADD THIS: Use refs to track pending operations
const pendingOperations = useRef({
  addTimeouts: [],
  removeTimeouts: [],
  isAdding: false,
  isRemoving: false
});

// FIXED addPanels function
const addPanels = (count) => {
//console.log("🟢 ADD PANELS:", count);
  //console.log(`Adding ${count} panels, current: ${S.current.currentPanels}`);

  // Clear any pending operations
  pendingOperations.current.addTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingOperations.current.addTimeouts = [];

  // Reset current panels count from DOM
  const actualCount = leftContentRef.current ? leftContentRef.current.children.length : 0;
  S.current.currentPanels = actualCount;

  const needed = count;
  //console.log(`Actually adding ${needed} panels`);

  for (let i = 0; i < needed; i++) {
    const timeout = setTimeout(() => {
      addSinglePanel();
      // Update count from DOM after each addition
      S.current.currentPanels = leftContentRef.current ? leftContentRef.current.children.length : 0;
    }, i * 500);

    pendingOperations.current.addTimeouts.push(timeout);
  }
};

// FIXED removePanels function
const removePanels = (count) => {
 //console.log("🟢 REMOVE PANELS:", count);
  //console.log(`Removing ${count} panels, current: ${S.current.currentPanels}`);

  // Clear any pending operations
  pendingOperations.current.removeTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingOperations.current.removeTimeouts = [];

  // Reset current panels count from DOM
  const actualCount = leftContentRef.current ? leftContentRef.current.children.length : 0;
  S.current.currentPanels = actualCount;

  const toRemove = Math.min(count, actualCount);
  //console.log(`Actually removing ${toRemove} panels`);

  for (let i = 0; i < toRemove; i++) {
    const timeout = setTimeout(() => {
      removeSinglePanel();
      // Update count from DOM after each removal
      S.current.currentPanels = leftContentRef.current ? leftContentRef.current.children.length : 0;
    }, i * 700);

    pendingOperations.current.removeTimeouts.push(timeout);
  }
};


// ADD THIS: Cleanup all timeouts on unmount
useEffect(() => {
  return () => {
    // Clear all pending timeouts
    pendingOperations.current.addTimeouts.forEach(timeout => clearTimeout(timeout));
    pendingOperations.current.removeTimeouts.forEach(timeout => clearTimeout(timeout));
    pendingOperations.current.addTimeouts = [];
    pendingOperations.current.removeTimeouts = [];

    // Reset state
    S.current.currentPanels = 0;
  };
}, []);

// ADD THIS: Reset on question change
useEffect(() => {
  // Clear any pending operations when question changes
  pendingOperations.current.addTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingOperations.current.removeTimeouts.forEach(timeout => clearTimeout(timeout));
  pendingOperations.current.addTimeouts = [];
  pendingOperations.current.removeTimeouts = [];

  // Reset panels based on current solarPanelCount
  if (leftContentRef.current) {
    leftContentRef.current.innerHTML = "";
    S.current.currentPanels = 0;

    // Add correct number of panels immediately (no animation on question change)
    if (solarPanelCount > 0) {
      for (let i = 0; i < solarPanelCount; i++) {
        addSinglePanel();
      }
      S.current.currentPanels = solarPanelCount;
      relayoutPanels();
    }
  }
}, [currentQuestion]);


  const addSinglePanel = () => {
    if (!leftContentRef.current) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Start position - above the bowl (fall from top)
    const startY = -200; // Start higher up
    g.setAttribute("transform", `translate(0, ${startY})`);
    g.setAttribute("opacity", "1"); // Start visible for falling effect

    const panel = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    panel.setAttribute("x", -C.PANEL_W / 2);
    panel.setAttribute("y", -C.PANEL_H / 2 - 13);
    panel.setAttribute("width", C.PANEL_W);
    panel.setAttribute("height", C.PANEL_H);
    panel.setAttribute("rx", C.PANEL_RX);
    panel.setAttribute("fill", "url(#panelPattern)");
    panel.setAttribute("stroke", "#0b2236");
    panel.setAttribute("strokeWidth", 1.1);
    g.appendChild(panel);

    leftContentRef.current.appendChild(g);
    S.current.currentPanels++;

    // Animate falling appearance
    animatePanelFalling(g);

    // Note: relayoutPanels will be called after the animation completes
    // Physics effect will also be triggered after animation
  };


  const relayoutPanels = () => {
    if (!leftContentRef.current) return;

    const panels = Array.from(leftContentRef.current.children);
    const usable = C.RIM_W - 2 * C.GRID_MARGIN;
    const cols = Math.max(1, Math.floor((usable + C.PANEL_GAP) / (C.PANEL_W + C.PANEL_GAP)));
    const totalRowWidth = (cols - 1) * (C.PANEL_W + C.PANEL_GAP);
    const xStart = -totalRowWidth / 2;

    panels.forEach((panel, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = xStart + col * (C.PANEL_W + C.PANEL_GAP);
      const y = C.RIM_Y - row * (C.PANEL_H + C.PANEL_GAP);
      panel.setAttribute("transform", `translate(${x}, ${y})`);
    });
  };



const animatePanelFalling = (panel) => {
  const startTime = Date.now();
  const duration = 800; // ms

  // Start from above
  const startY = -250;
  // Land at the bowl surface - the rim is at C.RIM_Y (-70)
  const targetY = C.RIM_Y;

  // Physics parameters
  const gravity = 0.5;
  let velocity = 0;
  let position = startY;
  let hasBounced = false;
  let animationComplete = false;

  const animate = () => {
    const elapsed = Date.now() - startTime;

    if (elapsed < duration && !animationComplete) {
      // Apply gravity
      velocity += gravity;
      position += velocity;

      // Check if hit the bowl surface
      if (position >= targetY && !hasBounced) {
        position = targetY;
        velocity = -velocity * 0.6; // Bounce with energy loss
        hasBounced = true;

        // Physics effect on bounce
        S.current.leftDipVel += 8;
      }

      // If we've bounced and gravity pulls us down again, stop at the surface
      if (hasBounced && position > targetY) {
        position = targetY;
        velocity = 0; // Stop all movement
        animationComplete = true; // End the animation
      }

      // Apply the transform
      panel.setAttribute("transform", `translate(0, ${position})`);

      if (!animationComplete) {
        requestAnimationFrame(animate);
      } else {
        // Finalize position and layout
        panel.setAttribute("transform", `translate(0, ${targetY})`);
        relayoutPanels();
        S.current.leftDipVel += 4;
      }
    } else {
      // Animation complete
      panel.setAttribute("transform", `translate(0, ${targetY})`);
      relayoutPanels();
      S.current.leftDipVel += 4;
    }
  };

  requestAnimationFrame(animate);
};

  const removeSinglePanel = () => {
    if (!leftContentRef.current || leftContentRef.current.children.length === 0) return;

    const lastPanel = leftContentRef.current.lastChild;
    if (lastPanel) {
      animatePanelRemoval(lastPanel, () => {
        lastPanel.remove();
        S.current.currentPanels--;
        relayoutPanels();

        // Physics effect
        S.current.leftDipVel -= 4;
      });
    }
  };

  const animatePanelAppearance = (panel) => {
    let opacity = 0;
    const animate = () => {
      opacity += 0.05;
      panel.setAttribute("opacity", opacity.toString());
      if (opacity < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };
  const animatePanelRemoval = (panel, onComplete) => {
    let opacity = 1;
    const animate = () => {
      opacity -= 0.05;
      panel.setAttribute("opacity", opacity.toString());
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    requestAnimationFrame(animate);
  };




const rebuildAnswerTiles = () => {
  //// console.log("🟠 REBUILDING ANSWER TILES");

  const g = rightContentRef.current;
  if (!g) return;

  g.innerHTML = "";

  answers.forEach((answer) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const questionIndex = answer.questionIndex !== undefined ? answer.questionIndex : "unknown";
    group.setAttribute("data-answer-id", answer.id);
    group.setAttribute("data-question-index", questionIndex.toString());
    group.setAttribute("class", "answer-tile-group");

    // Background - will be transformed on hover
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", -C.TILE_W / 2);
    bg.setAttribute("y", -C.TILE_H / 2);
    bg.setAttribute("width", C.TILE_W);
    bg.setAttribute("height", C.TILE_H);
    bg.setAttribute("rx", C.TILE_RX);
    bg.setAttribute("fill", "white");
    bg.setAttribute("stroke", "#111");
    bg.setAttribute("strokeWidth", 2);
    bg.setAttribute("class", "answer-tile-bg");

    // Answer image - will be hidden on hover
    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
    img.setAttribute("href", answer.image);
    img.setAttribute("x", -C.TILE_W / 2);
    img.setAttribute("y", -C.TILE_H / 2);
    img.setAttribute("width", C.TILE_W);
    img.setAttribute("height", C.TILE_H);
    img.setAttribute("preserveAspectRatio", "xMidYMid slice");
    img.setAttribute("class", "answer-tile-image");
    img.setAttribute("opacity", "1");

    // Energy text - hidden by default, shown on hover
    const energyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    energyText.setAttribute("x", 0);
    energyText.setAttribute("y", 8);
    energyText.setAttribute("text-anchor", "middle");
    energyText.setAttribute("fill", "white");
    energyText.setAttribute("font-size", "18");
    energyText.setAttribute("font-weight", "bold");
    energyText.setAttribute("font-family", "Arial, sans-serif");
    energyText.setAttribute("class", "energy-text");
    energyText.setAttribute("opacity", "0");
    energyText.textContent = `${(individualEnergies[answer.id] || 0).toFixed(1)}`;

    // Hover effects
    const handleMouseEnter = () => {
      //// console.log(`🖱️ Transforming answer ${answer.id}`);

      // Change background to colored
      bg.setAttribute("fill", palette[answer.questionIndex] || "#0d6efd");
      bg.setAttribute("stroke", "#fff");
      bg.setAttribute("strokeWidth", "3");

      // Hide image
      img.setAttribute("opacity", "0");

      // Show energy text
      energyText.setAttribute("opacity", "1");

      setHoveredAnswer(answer);
    };

    const handleMouseLeave = () => {
      //// console.log(`🖱️ Restoring answer ${answer.id}`);

      // Restore original background
      bg.setAttribute("fill", "white");
      bg.setAttribute("stroke", "#111");
      bg.setAttribute("strokeWidth", "2");

      // Show image
      img.setAttribute("opacity", "1");

      // Hide energy text
      energyText.setAttribute("opacity", "0");

      setHoveredAnswer(null);
    };

    // Add event listeners to both background and image
    [bg, img].forEach(element => {
      element.style.cursor = "pointer";
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      // Touch events for mobile
      element.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (hoveredAnswer && hoveredAnswer.id === answer.id) {
          handleMouseLeave();
        } else {
          handleMouseEnter();
        }

        // Auto-revert after 2 seconds on mobile
        setTimeout(() => {
          if (hoveredAnswer && hoveredAnswer.id === answer.id) {
            handleMouseLeave();
          }
        }, 2000);
      });
    });

    // Append all elements
    group.appendChild(bg);
    group.appendChild(img);
    group.appendChild(energyText);

    // Remove button
    const canDelete = canDeleteAnswer(answer.id);
    if (canDelete) {
      const crossGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      crossGroup.setAttribute("transform", `translate(${C.TILE_W / 2 - 6}, ${-C.TILE_H / 2 - 23})`);

      crossGroup.style.cursor = "pointer";
      crossGroup.style.pointerEvents = "all";

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", 0);
      circle.setAttribute("cy", 0);
      circle.setAttribute("r", 10);
      circle.setAttribute("fill", "#ffbdbd");
      circle.setAttribute("stroke", "#333");
      circle.setAttribute("strokeWidth", 1);
      crossGroup.appendChild(circle);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M -2.5,-2.5 L 2.5,2.5 M -2.5,2.5 L 2.5,-2.5");
      path.setAttribute("stroke", "#333");
      path.setAttribute("strokeWidth", 1.3);
      path.setAttribute("stroke-linecap", "round");
      crossGroup.appendChild(path);

      crossGroup.addEventListener("click", (e) => {
        e.stopPropagation();
        onAnswerRemove && onAnswerRemove(answer.id);
      });
      group.appendChild(crossGroup);
    }

    g.appendChild(group);
  });

  layoutAnswers();
};


const layoutAnswers = () => {
  if (!rightContentRef.current) return;

  const tiles = Array.from(rightContentRef.current.children);
    const isSmallScreen = window.screen.width <= 537;
    console.log("SMALL",isSmallScreen);

      const isSuperSmallScreen = window.screen.width <= 375;
        console.log("SUPER SMALL",isSuperSmallScreen);


  const tileYOffset = isSmallScreen ? isSuperSmallScreen ? -45 : -28 : -28;

  if (isSmallScreen) {
    const tilesByOriginalQuestion = {};
    tiles.forEach(tile => {
      const originalQuestionIndex = tile.getAttribute('data-question-index');
      if (!tilesByOriginalQuestion[originalQuestionIndex]) {
        tilesByOriginalQuestion[originalQuestionIndex] = [];
      }
      tilesByOriginalQuestion[originalQuestionIndex].push(tile);
    });

    // Get unique original question indices and sort them
    const originalQuestionIndices = Object.keys(tilesByOriginalQuestion).sort((a, b) => parseInt(a) - parseInt(b));

    // Remap original indices to sequential indices (0, 1, 2, ...)
    const indexMapping = {};
    originalQuestionIndices.forEach((originalIndex, newIndex) => {
      indexMapping[originalIndex] = newIndex;
    });

    tiles.forEach(tile => {

      const originalQuestionIndex = tile.getAttribute('data-question-index');
      const newQuestionIndex = indexMapping[originalQuestionIndex];

      // Calculate position based on new sequential index
      const dopVarX = 62*(newQuestionIndex % 3 + 1);
      const dopVarY =  -50 * (Math.floor(newQuestionIndex / 3) + 1) - 15 ;


      // Update background position
      const bg = tile.querySelector('.answer-tile-bg');
      if (bg) {
        bg.setAttribute("y", -C.TILE_H / 2 + tileYOffset + dopVarY);
        bg.setAttribute("x", -153 + dopVarX);
      }

      // Update image position
      const img = tile.querySelector('.answer-tile-image');
      if (img) {
        img.setAttribute("y", -C.TILE_H / 2 + tileYOffset + dopVarY);
        img.setAttribute("x", -153 + dopVarX);
      }

      // Update energy text position
      const energyText = tile.querySelector('.energy-text');
      if (energyText) {
        energyText.setAttribute("y", tileYOffset + 8 + dopVarY);
        energyText.setAttribute("x", -120 + dopVarX);
      }

      // Update cross button position for mobile
      const crossGroup = tile.querySelector('g:has(circle):has(path[stroke="#333"])');
      if (crossGroup) {
        const crossY = -C.TILE_H / 2 - 24 + dopVarY - (isSuperSmallScreen ? 17:0);
        crossGroup.setAttribute("transform", `translate(${C.TILE_W / 2 - 130 + dopVarX}, ${crossY})`);
      }

    });

    // Add badges for groups with multiple answers
    originalQuestionIndices.forEach(originalIndex => {
      const questionTiles = tilesByOriginalQuestion[originalIndex];
      const newQuestionIndex = indexMapping[originalIndex];

      if (questionTiles.length > 1) {
        // Calculate position for badge based on new sequential index
        const dopVarX = -66 * (newQuestionIndex % 3 + 1);
        const dopVarY = -51 * (Math.floor(newQuestionIndex / 3) + 1) - 15;

        const baseX = -540 - dopVarX;
        const baseY = C.RIM_Y + dopVarY + (isSuperSmallScreen ? 10:0);

        // Add stack counter badge
        const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        badge.setAttribute("cx", baseX - C.TILE_W/2 +410);
        badge.setAttribute("cy", baseY - C.TILE_H/2 +33);
        badge.setAttribute("r", "12");
        badge.setAttribute("fill", "#0d6efd");
        badge.setAttribute("stroke", "#fff");
        badge.setAttribute("strokeWidth", "2");

        const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        badgeText.setAttribute("x", baseX - C.TILE_W/2 + 410);
        badgeText.setAttribute("y", baseY - C.TILE_H/2 +37);
        badgeText.setAttribute("text-anchor", "middle");
        badgeText.setAttribute("fill", "white");
        badgeText.setAttribute("font-size", "14");
        badgeText.setAttribute("font-weight", "bold");
        badgeText.textContent = questionTiles.length;

        rightContentRef.current.appendChild(badge);
        rightContentRef.current.appendChild(badgeText);

        // Hide all but the first tile in this group
        questionTiles.slice(1).forEach(tile => {
          tile.style.display = "none";
        });

        // Ensure the first tile is visible
        if (questionTiles[0]) {
          questionTiles[0].style.display = "";
        }
      } else {
        // Single tile - ensure it's visible
        if (questionTiles[0]) {
          questionTiles[0].style.display = "";
        }
      }
    });

  } else {
    // LARGE SCREEN LAYOUT - Original logic

    // Apply Y offset to all tile elements
    tiles.forEach(tile => {
      // Update background position
      const bg = tile.querySelector('.answer-tile-bg');
      if (bg) {
        bg.setAttribute("y", -C.TILE_H / 2 + tileYOffset);
      }

      // Update image position
      const img = tile.querySelector('.answer-tile-image');
      if (img) {
        img.setAttribute("y", -C.TILE_H / 2 + tileYOffset);
      }

      // Update energy text position
      const energyText = tile.querySelector('.energy-text');
      if (energyText) {
        energyText.setAttribute("y", tileYOffset + 8);
      }

      // Update cross button position for mobile
      const crossGroup = tile.querySelector('g[cursor="pointer"]');
      if (crossGroup && isSmallScreen) {
        const crossY = -C.TILE_H / 2 - 107;
        crossGroup.setAttribute("transform", `translate(${C.TILE_W / 2 - 6}, ${crossY})`);
      }
    });

    // Group by question for large screen layout
    const tilesByQuestion = {};
    tiles.forEach(tile => {
      const questionIndex = tile.getAttribute('data-question-index');
      if (!tilesByQuestion[questionIndex]) {
        tilesByQuestion[questionIndex] = [];
      }
      tilesByQuestion[questionIndex].push(tile);
    });

    // Calculate grid
    const usable = C.RIM_W - 2 * C.GRID_MARGIN;
    const cols = 3;
    const totalRowWidth = (cols - 1) * (C.TILE_W + C.TILE_GAP);
    const xStart = -totalRowWidth / 2;

    const questionIndices = Object.keys(tilesByQuestion).sort((a, b) => parseInt(a) - parseInt(b));

    questionIndices.forEach((questionIndex, groupIndex) => {
      const questionTiles = tilesByQuestion[questionIndex];
      const col = groupIndex % cols;
      const row = Math.floor(groupIndex / cols);

      const baseX = xStart + col * (C.TILE_W + C.TILE_GAP);
      const baseY = C.RIM_Y - row * (C.TILE_H + C.TILE_GAP);

      if (questionTiles.length > 1) {
        // Show first answer with stack counter
        questionTiles[0].setAttribute("transform", `translate(${baseX}, ${baseY})`);

        // Add stack counter badge - LEFT TOP CORNER
        const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        badge.setAttribute("cx", baseX - C.TILE_W/2 + 8);
        badge.setAttribute("cy", baseY - C.TILE_H/2 - 28);
        badge.setAttribute("r", "12");
        badge.setAttribute("fill", "#0d6efd");
        badge.setAttribute("stroke", "#fff");
        badge.setAttribute("strokeWidth", "2");

        const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        badgeText.setAttribute("x", baseX - C.TILE_W/2 + 8);
        badgeText.setAttribute("y", baseY - C.TILE_H/2 - 24);
        badgeText.setAttribute("text-anchor", "middle");
        badgeText.setAttribute("fill", "white");
        badgeText.setAttribute("font-size", "14");
        badgeText.setAttribute("font-weight", "bold");
        badgeText.textContent = questionTiles.length;

        rightContentRef.current.appendChild(badge);
        rightContentRef.current.appendChild(badgeText);

        // Hide other answers in the stack
        questionTiles.slice(1).forEach(tile => {
          tile.style.display = "none";
        });
      } else {
        questionTiles[0].setAttribute("transform", `translate(${baseX}, ${baseY})`);
      }
    });
  }
};

  // PHYSICS
    const currentLeftBowlPos = () => {
        const rad = (S.current.angle * Math.PI) / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        return {
          x: C.pivot.x - C.halfLen * c,
          y: C.pivot.y - C.halfLen * s + S.current.leftDip
        };
      };

      const currentRightBowlPos = () => {
        const rad = (S.current.angle * Math.PI) / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        return {
          x: C.pivot.x + C.halfLen * c,
          y: C.pivot.y + C.halfLen * s + S.current.rightDip
        };
      };


  // Main animation loop

  // UPDATED Main animation loop with gradual mass transitions
  useEffect(() => {
  //console.log("🎬 STARTING ANIMATION LOOP");
    let raf = 0;
    let frameCount = 0;

    const updateGradualMasses = () => {
      // Gradually move current masses toward target masses
      const leftDiff = massTweens.current.left.target - massTweens.current.left.current;
      const rightDiff = massTweens.current.right.target - massTweens.current.right.current;

      massTweens.current.left.current += leftDiff * massTweens.current.left.speed;
      massTweens.current.right.current += rightDiff * massTweens.current.right.speed;

      // Update physics state with gradual masses
      S.current.leftMass = massTweens.current.left.current;
      S.current.rightMass = massTweens.current.right.current;
            if (frameCount % 60 === 0) {
              //console.log("📊 Masses - Left:", S.current.leftMass.toFixed(2), "Right:", S.current.rightMass.toFixed(2), "Targets - Left:", massTweens.current.left.target, "Right:", massTweens.current.right.target);
            }

    };

    const loop = () => {
    frameCount++;
      // Update masses gradually first
      updateGradualMasses();


        const massDifference = S.current.rightMass - S.current.leftMass;
      // BEAM PHYSICS with slower parameters
      const target = Math.max(
        -C.maxAngle,
        Math.min(C.maxAngle, (S.current.rightMass - S.current.leftMass) * C.kAngle)
      );

      // Much slower acceleration and damping
      const angAcc = (target - S.current.angle) * C.accelK - C.damping * S.current.angVel;
      S.current.angVel += angAcc;
      S.current.angle += S.current.angVel;

        // Log physics state occasionally
        if (frameCount % 60 === 0) {
          //console.log("🎯 Physics - Angle:", S.current.angle.toFixed(3), "Target:", target.toFixed(3),  "MassDiff:", massDifference.toFixed(2), "AngVel:", S.current.angVel.toFixed(4));
        }

      // Gentle clamp
      if (Math.abs(S.current.angle) > C.maxAngle) {
        S.current.angle = Math.sign(S.current.angle) * C.maxAngle;
        S.current.angVel *= 0.8; // Less bounce back
      }

      // Slower bowl dip springs
      S.current.leftDipVel += -C.dipStiffness * S.current.leftDip - C.dipDamping * S.current.leftDipVel;
      S.current.rightDipVel += -C.dipStiffness * S.current.rightDip - C.dipDamping * S.current.rightDipVel;
      S.current.leftDip += S.current.leftDipVel;
      S.current.rightDip += S.current.rightDipVel;

      // Apply transforms
      if (beamRef.current) {
        beamRef.current.setAttribute("transform", `rotate(${S.current.angle.toFixed(3)} ${C.pivot.x} ${C.pivot.y})`);

                // Log rotation occasionally
                if (frameCount % 120 === 0 && Math.abs(S.current.angle) > 0.1) {
                  //console.log("🔄 BEAM ROTATION:", S.current.angle.toFixed(3), "degrees");
                }


      }




      const lb = currentLeftBowlPos();
      const rb = currentRightBowlPos();

      if (leftBowlRef.current) {
        leftBowlRef.current.setAttribute("transform", `translate(${lb.x.toFixed(3)}, ${lb.y.toFixed(3)})`);
      }
      if (rightBowlRef.current) {
        rightBowlRef.current.setAttribute("transform", `translate(${rb.x.toFixed(3)}, ${rb.y.toFixed(3)})`);
      }
      if (leftContentRef.current) {
        leftContentRef.current.setAttribute("transform", `translate(${lb.x.toFixed(3)}, ${lb.y.toFixed(3)})`);
      }
      if (rightContentRef.current) {
        rightContentRef.current.setAttribute("transform", `translate(${rb.x.toFixed(3)}, ${rb.y.toFixed(3)})`);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
          //console.log("🛑 STOPPING ANIMATION LOOP");
          cancelAnimationFrame(raf);
        };

    return () => cancelAnimationFrame(raf);
  }, [C]);


  // Drop handlers

const handleDrop = (e) => {
 // console.log("🎯 DROP EVENT in ScaleDisplay");
  e.preventDefault();

  // Let the parent component handle the data extraction
  onAnswerDrop && onAnswerDrop(e);
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
};

  // Keep your existing SVG return statement (it's perfect)
    return (
      <div className="scale-display-container">


      <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={window.screen.width <= 537 ? "130 0 850 220" : "-100 0 1350 340"}
                className="ancient-scale"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ width: '100%', height: '500px' }}
              >
              {/* Your existing SVG content remains exactly the same */}
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffdf5a" />
                  <stop offset="100%" stopColor="#b67a1a" />
                </linearGradient>
                <linearGradient id="goldInnerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe98a" />
                  <stop offset="100%" stopColor="#d9a326" />
                </linearGradient>
                <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#54585b" />
                  <stop offset="100%" stopColor="#2b2e31" />
                </linearGradient>
                <pattern id="panelPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="#12314c" />
                  <path d="M0 0H10M0 5H10M5 0V10" stroke="#6fb1ff" strokeWidth="0.8" opacity="0.7" />
                </pattern>
              </defs>

              {/* Base structure */}
              <rect x="150" y="430" width="790" height="60" rx="20" fill="url(#baseGradient)" stroke="#1a1a1a" strokeWidth="4" />
              <rect x="190" y="490" width="170" height="16" rx="4" fill="url(#baseGradient)" stroke="#1a1a1a" strokeWidth="4" />
              <rect x="730" y="490" width="170" height="16" rx="4" fill="url(#baseGradient)" stroke="#1a1a1a" strokeWidth="4" />

              <rect x="240" y="447" width="615" height="18" rx="6" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4"/>


              <rect x="536" y="222" width="28" height="210" rx="8" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="4" />
              <rect x="520" y="414" width="60" height="24" rx="9" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="4" />
              <rect x="500" y="424" width="100" height="15" rx="9" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="4"/>
              <path d="M550 200 L575 242 L525 242 Z" fill="url(#baseGradient)" stroke="#1a1a1a" strokeWidth="4" strokeLinejoin="round" />

              {/* ROTATING BEAM - This will now rotate properly */}
              <g ref={beamRef} transform="rotate(0 550 200)">
                <rect x="264" y="190" width="572" height="20" rx="10" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="550" cy="200" r="36" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="4" />
              </g>

              <g ref={leftBowlRef} transform="translate(264,200)">
                <rect x="-10" y="-40" width="20" height="20" rx="3" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
                <rect x="-90" y="-70" width="180" height="10" rx="5" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
                <path d="M -80 -60 C -70 -30, 70 -30, 80 -60 Z" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="0" cy="0" r="16" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
              </g>
              <g ref={rightBowlRef} transform="translate(836,200)">
                <rect x="-10" y="-40" width="20" height="20" rx="3" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
                <rect x="-90" y="-70" width="180" height="10" rx="5" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
                <path d="M -80 -60 C -70 -30, 70 -30, 80 -60 Z" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="0" cy="0" r="16" fill="url(#goldGradient)" stroke="#8a5a12" strokeWidth="3" />
              </g>

              <g ref={leftContentRef} transform="translate(264,200)"></g>
              <g ref={rightContentRef} transform="translate(836,200)" width="500" height="210"></g>
              {/*<g ref={fallingLayerRef}></g>*/}

            </svg>

      <div className="scale-drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
        {answers.length === 0 && (
          <div className="drop-zone-hint">🎯 <Trans i18nKey="new-changes.DragHere" /></div>
        )}
      </div>

    </div>
  );
};

export default ScaleDisplay;
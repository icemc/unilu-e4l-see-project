import React, { Component } from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Trans } from "react-i18next";
import { Redirect } from "react-router-dom";

import ScaleDisplay from "./ScaleDisplay";
import AnswerBlock from "./AnswerBlock";
import { seminarsGetRequest } from "../../action/seminarAction";
import {
  fetchQuestionnaire,
  nextPage,
  previousPage,
  restartQuestionnaire
} from "../../action/questionnaireAction";
import { sendSession, computeEnergy } from "../../action/answerAction";
import { showNavButton } from "../../action/navAction";

@connect((store) => {
  return {
    questionnaireReducer: store.questionnaireReducer,
    answerReducer: store.answerReducer,
    userReducer: store.userReducer,
  };
})
export class KidsQuestionnaire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataIsFetched: false,
      allAnswersOnScale: [],
      selectedAnswersByQuestion: {},
      totalEnergy: 0,
      isAnimating: false,
      currentQuestionAnswers: [],
      draggedAnswer: null,
      solarPanelCount: 0,
      individualEnergies: {},
    };
  }

handleResize = () => {
  // Force re-render when screen size changes to update mobile state
  this.forceUpdate();
};

componentDidUpdate(prevProps, prevState) {
  const { currentQuestion } = this.props.questionnaireReducer;

  if (prevProps.questionnaireReducer.currentQuestion !== currentQuestion) {
   //console.log(`🔄 Question changed to: ${currentQuestion}`);
   //console.log(`📊 Current question answers:`, this.state.selectedAnswersByQuestion[currentQuestion] || []);
   //console.log(`📊 canGoNext result:`, this.canGoNext());
  }
}

  componentDidMount() {
    if (!this.props.questionnaireReducer.fetched) {
      this.props.dispatch(fetchQuestionnaire()).then(() => {
        this.setState({ dataIsFetched: true });
        this.loadSavedState();
      });
    } else {
      this.setState({ dataIsFetched: true });
      this.loadSavedState();
    }

     window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);
  }

    isMobileDevice = () => {
        //console.log(window.innerWidth);
      return window.innerWidth <= 768;
    };


findMatchingAnswer = (answerName, allAnswers) => {
  const normalizedSearch = answerName.toLowerCase().trim();

  // First try exact match
  let matchingAnswer = allAnswers.find(answer =>
    answer.name.toLowerCase().trim() === normalizedSearch
  );

  if (matchingAnswer) return matchingAnswer;

  // Then try contains match, but only if it's the best match
  const containsMatches = allAnswers.filter(answer =>
    answer.name.toLowerCase().includes(normalizedSearch) ||
    normalizedSearch.includes(answer.name.toLowerCase())
  );

  // If multiple contains matches, find the one with the closest length
  if (containsMatches.length > 0) {
    if (containsMatches.length === 1) {
      return containsMatches[0];
    }

    // For multiple matches, pick the one with closest length (most specific)
    return containsMatches.reduce((best, current) => {
      const bestDiff = Math.abs(best.name.length - normalizedSearch.length);
      const currentDiff = Math.abs(current.name.length - normalizedSearch.length);
      return currentDiff < bestDiff ? current : best;
    });
  }

  return null;
};


handleAnswerAdd = (answerWithVariables) => {
 // console.log("🎯 HANDLE ANSWER ADD via button:", answerWithVariables);

  const { currentQuestion } = this.props.questionnaireReducer;
  const currentQuestionObj = this.getCurrentQuestion();
  const currentAnswers = this.state.selectedAnswersByQuestion[currentQuestion] || [];

  if (!this.canSelectAnswer(answerWithVariables)) {
   // console.log("❌ Cannot select this answer");
    return;
  }

  if (currentAnswers.length >= currentQuestionObj.maxAnswersNumber) {
   // console.log("❌ Maximum answers reached for this question");
    return;
  }

  // Create answer object with variables
  const answerToAdd = {
    ...answerWithVariables,
    questionIndex: currentQuestion,
    variableValues: answerWithVariables.variableValues || []
  };

 // console.log("✅ Adding answer via button:", answerToAdd);

  const newCurrentAnswers = [...currentAnswers, answerToAdd];
  const newSelectedAnswersByQuestion = {
    ...this.state.selectedAnswersByQuestion,
    [currentQuestion]: newCurrentAnswers
  };

  const isAlreadyOnScale = this.state.allAnswersOnScale.find(a => a.id === answerWithVariables.id);
  const newAllAnswersOnScale = isAlreadyOnScale
    ? this.state.allAnswersOnScale
    : [...this.state.allAnswersOnScale, answerToAdd];

  this.setState({
    allAnswersOnScale: newAllAnswersOnScale,
    selectedAnswersByQuestion: newSelectedAnswersByQuestion,
    currentQuestionAnswers: newCurrentAnswers,
    isAnimating: true,
  }, async () => {
    this.saveState();
    await this.calculateTotalEnergy();
    this.setState({ isAnimating: false });
  });
};



  // Update loadSavedState

  // Update saveState and loadSavedState to include solarPanelCount
loadSavedState = () => {
  const saved = localStorage.getItem('kidsQuestionnaireState');
  if (saved) {
    const state = JSON.parse(saved);
    this.setState({
      allAnswersOnScale: state.allAnswersOnScale || [],
      selectedAnswersByQuestion: state.selectedAnswersByQuestion || {},
      solarPanelCount: state.solarPanelCount || 0,
      individualEnergies: state.individualEnergies || {},
    }, () => {
      this.updateCurrentQuestionAnswers();
      this.calculateTotalEnergy();
    });
  }
};

saveState = () => {
  const stateToSave = {
    allAnswersOnScale: this.state.allAnswersOnScale.map(answer => ({
      ...answer,
      // Ensure variableValues are saved
      variableValues: answer.variableValues || []
    })),
    selectedAnswersByQuestion: this.state.selectedAnswersByQuestion,
    solarPanelCount: this.state.solarPanelCount,
    individualEnergies: this.state.individualEnergies,
  };
  localStorage.setItem('kidsQuestionnaireState', JSON.stringify(stateToSave));
};


updateCurrentQuestionAnswers = () => {
  const { currentQuestion } = this.props.questionnaireReducer;
  const currentAnswers = this.state.selectedAnswersByQuestion[currentQuestion] || [];

//console.log(`🔄 Updating current question answers for Q${currentQuestion}:`, currentAnswers.length);

  this.setState({
    currentQuestionAnswers: currentAnswers
  }, () => {
  //console.log(`🔄 Updated - currentQuestionAnswers for Q${currentQuestion}:`, this.state.currentQuestionAnswers.length);
  });
};


checkAllQuestionsMandatoryStatus = () => {
  const { questionnaire } = this.props.questionnaireReducer;
  const questions = questionnaire.questions || [];

//console.log("=== MANDATORY QUESTIONS CHECK ===");
  questions.forEach((question, index) => {
    const questionAnswers = this.state.selectedAnswersByQuestion[index] || [];
    const isMandatory = question.minAnswersNumber > 0;
    const hasMinimum = questionAnswers.length >= question.minAnswersNumber;

  //console.log(`Q${index}: mandatory=${isMandatory}, minRequired=${question.minAnswersNumber}, hasAnswers=${questionAnswers.length}, meetsRequirement=${hasMinimum}`);
  });
//console.log("=== END CHECK ===");
};

  // Get answers that should be displayed on scale (from ALL questions)
  getAllAnswersForScale = () => {
    return this.state.allAnswersOnScale;
  };

  // Handle drag start
  handleDragStart = (answer) => {
    this.setState({ draggedAnswer: answer });
  };


// In handleAnswerDrop method:
handleAnswerDrop = async (e) => {
  e.preventDefault();

  // CRITICAL: Get the data from the drag event, not from state
  let draggedAnswer;
  try {
    const answerData = e.dataTransfer.getData("application/json");

    if (answerData) {
      draggedAnswer = JSON.parse(answerData);
     // console.log("📥 variableValues from drag:", draggedAnswer.variableValues);
    }
  } catch (error) {
    console.error("❌ Error parsing drag data:", error);
    return;
  }

  const { currentQuestion } = this.props.questionnaireReducer;

  if (!draggedAnswer) {
   // console.log("❌ No dragged answer found");
    return;
  }

  const currentQuestionObj = this.getCurrentQuestion();
  const currentAnswers = this.state.selectedAnswersByQuestion[currentQuestion] || [];

  if (currentAnswers.length >= currentQuestionObj.maxAnswersNumber) {
    this.setState({ draggedAnswer: null });
    return;
  }

  // Use the answer data FROM THE DRAG EVENT, not from state
  const answerToAdd = {
    ...draggedAnswer,
    questionIndex: currentQuestion,
    variableValues: draggedAnswer.variableValues || [] // This should now contain the values
  };

 // console.log("✅ FINAL answer to add:", answerToAdd);
 // console.log("✅ variableValues being added:", answerToAdd.variableValues);

  const newCurrentAnswers = [...currentAnswers, answerToAdd];
  const newSelectedAnswersByQuestion = {
    ...this.state.selectedAnswersByQuestion,
    [currentQuestion]: newCurrentAnswers
  };

  const isAlreadyOnScale = this.state.allAnswersOnScale.find(a => a.id === draggedAnswer.id);
  const newAllAnswersOnScale = isAlreadyOnScale
    ? this.state.allAnswersOnScale
    : [...this.state.allAnswersOnScale, answerToAdd];

  this.setState({
    allAnswersOnScale: newAllAnswersOnScale,
    selectedAnswersByQuestion: newSelectedAnswersByQuestion,
    currentQuestionAnswers: newCurrentAnswers,
    isAnimating: true,
    draggedAnswer: null,
  }, async () => {
    this.saveState();
    await this.calculateTotalEnergy();
    this.setState({ isAnimating: false });
  });
};



// Also update handleAnswerClick for mobile:
handleAnswerClick = async (answer) => {
  if (!this.isMobileDevice()) return;

  const { currentQuestion } = this.props.questionnaireReducer;
  const currentQuestionObj = this.getCurrentQuestion();
  const currentAnswers = this.state.selectedAnswersByQuestion[currentQuestion] || [];

  if (!this.canSelectAnswer(answer)) {
    return;
  }

  if (currentAnswers.length >= currentQuestionObj.maxAnswersNumber) {
    return;
  }

  // Use the variableValues from AnswerBlock
  const answerToAdd = {
    ...answer,
    questionIndex: currentQuestion,
    variableValues: answer.variableValues || []
  };

 // console.log("✅ Adding answer via click with variableValues:", answerToAdd.variableValues);

  const newCurrentAnswers = [...currentAnswers, answerToAdd];
  const newSelectedAnswersByQuestion = {
    ...this.state.selectedAnswersByQuestion,
    [currentQuestion]: newCurrentAnswers
  };

  const isAlreadyOnScale = this.state.allAnswersOnScale.find(a => a.id === answer.id);
  const newAllAnswersOnScale = isAlreadyOnScale
    ? this.state.allAnswersOnScale
    : [...this.state.allAnswersOnScale, answerToAdd];

  this.setState({
    allAnswersOnScale: newAllAnswersOnScale,
    selectedAnswersByQuestion: newSelectedAnswersByQuestion,
    currentQuestionAnswers: newCurrentAnswers,
    isAnimating: true,
  }, async () => {
    this.saveState();
    await this.calculateTotalEnergy();
    this.setState({ isAnimating: false });
  });
};

// And in calculateTotalEnergy, make sure iskid is set:
calculateTotalEnergy = async () => {
  const { session } = this.props.answerReducer;
  const answersOnScale = this.state.allAnswersOnScale;

 // console.log("🔍 CALCULATE TOTAL ENERGY - Answers on scale:", answersOnScale);

  // Use the variableValues directly from the answers
  const answersPayload = answersOnScale.map(answer => ({
    possibleAnswer: { id: answer.id },
    variableValues: answer.variableValues || []
  }));

 // console.log("📤 Sending payload to backend:", answersPayload);

  const tempSession = {
    ...session,
    answers: answersPayload,
    iskid: true // CRITICAL: Set this to true
  };

  // Rest of the method remains the same...
  try {
    await this.props.dispatch(computeEnergy(tempSession));
    const { calculationResult } = this.props.answerReducer;

    if (calculationResult) {
      const totalEnergy = calculationResult.result || 0;
     // console.log("💡 Total energy from backend:", totalEnergy);

      // Extract individual energy values
      const individualEnergies = {};


if (calculationResult.scores && calculationResult.breakdown) {
 // console.log("🎯 Processing breakdown for individual energies");

  calculationResult.breakdown.forEach((breakdownItem, breakdownIndex) => {
   // console.log(`🔍 Breakdown ${breakdownIndex}:`, breakdownItem);

    // Handle breakdown items with multiple sub-answers (like pets)
    if (breakdownItem.answers && breakdownItem.answers.length > 0) {
     // console.log(`🔍 Breakdown has ${breakdownItem.answers.length} sub-answers`);

      breakdownItem.answers.forEach((subAnswer, subIndex) => {
       // console.log(`🔍 Sub-answer ${subIndex}:`, subAnswer.answer);

        // Find the matching answer by name
        const matchingAnswer = this.findMatchingAnswer(subAnswer.answer, this.state.allAnswersOnScale);

        if (matchingAnswer) {
          // Use the result from the sub-answer if available, otherwise use the breakdown result
          const energyValue = subAnswer.result || breakdownItem.result || calculationResult.scores[breakdownIndex] || 0;
          individualEnergies[matchingAnswer.id] = energyValue;
         // console.log(`✅ Stored energy for ${matchingAnswer.name} (ID: ${matchingAnswer.id}):`, energyValue);
        }
      });
    } else {
      // Single answer in breakdown - try multiple matching strategies

      // STRATEGY 1: Direct answer matching by name
      const answerNameFromBreakdown = breakdownItem.question.split(':')[0].trim() || '';
      let matchingAnswer = this.state.allAnswersOnScale.find(answer =>
        breakdownItem.question.toLowerCase().includes(answer.name.toLowerCase()) ||
        answer.name.toLowerCase().includes(answerNameFromBreakdown.toLowerCase())
      );

      // STRATEGY 2: Index-based matching as fallback
      if (!matchingAnswer && this.state.allAnswersOnScale[breakdownIndex]) {
        matchingAnswer = this.state.allAnswersOnScale[breakdownIndex];
       // console.log(`🔄 Using index-based fallback for breakdown ${breakdownIndex}`);
      }

      if (matchingAnswer) {
        const energyValue = breakdownItem.result || calculationResult.scores[breakdownIndex] || 0;
        individualEnergies[matchingAnswer.id] = energyValue;
       // console.log(`✅ Stored energy for ${matchingAnswer.name} (ID: ${matchingAnswer.id}):`, energyValue);
      } else {
       // console.log(`❌ No matching answer found for breakdown item ${breakdownIndex}`);
      }
    }
  });

  // CRITICAL: Also assign energy to answers that weren't matched in breakdown
  // This handles fixed answers without variables
  this.state.allAnswersOnScale.forEach(answer => {
    if (!individualEnergies[answer.id]) {
      // Try to find this answer's energy in the calculation result
      const answerEnergy = this.findAnswerEnergyInCalculation(answer, calculationResult);
      if (answerEnergy !== null) {
        individualEnergies[answer.id] = answerEnergy;
       // console.log(`🔄 Assigned energy to unmatched answer ${answer.name}:`, answerEnergy);
      } else {
        // Default to 0 if no energy found
        individualEnergies[answer.id] = 0;
       // console.log(`❓ No energy found for answer ${answer.name}, defaulting to 0`);
      }
    }
  });
}

      const solarPanelCount = Math.round(totalEnergy / 10);

      this.setState({
        totalEnergy,
        solarPanelCount,
        individualEnergies,
      });
    }
  } catch (error) {
    console.error("🚨 Energy calculation failed:", error);
  }
};



findAnswerEnergyInCalculation = (answer, calculationResult) => {
  if (!calculationResult.breakdown) return null;

  // Search through all breakdown items for this answer
  for (const breakdownItem of calculationResult.breakdown) {
    // Check if this breakdown item contains our answer
    if (breakdownItem.answers) {
      // Check sub-answers
      const matchingSubAnswer = breakdownItem.answers.find(subAnswer =>
        subAnswer.answer.toLowerCase().includes(answer.name.toLowerCase()) ||
        answer.name.toLowerCase().includes(subAnswer.answer.toLowerCase())
      );
      if (matchingSubAnswer && matchingSubAnswer.result !== undefined) {
        return matchingSubAnswer.result;
      }
    }

    // Check if the breakdown question matches our answer
    if (breakdownItem.question.toLowerCase().includes(answer.name.toLowerCase())) {
      return breakdownItem.result || 0;
    }
  }

  return null;
};






extractAnswerIdFromBreakdown = (breakdownItem, index) => {
  const { calculationResult } = this.props.answerReducer;
  const answersOnScale = this.state.allAnswersOnScale;

 // console.log(`🎯 extractAnswerIdFromBreakdown for breakdown item:`, breakdownItem);
 // console.log(`🔍 Breakdown item has answers:`, breakdownItem.answers);

  // METHOD 1: If breakdown item has answers array, match by answer text
  if (breakdownItem.answers && breakdownItem.answers.length > 0) {
   // console.log(`🔍 Processing breakdown with ${breakdownItem.answers.length} sub-answers`);

    // For each sub-answer in the breakdown, find the matching answer
    breakdownItem.answers.forEach((subAnswer, subIndex) => {
     // console.log(`🔍 Sub-answer ${subIndex}:`, subAnswer.answer);

      // Try to find matching answer by name
      const matchingAnswer = answersOnScale.find(answer => {
        const nameMatch = answer.name.toLowerCase().includes(subAnswer.answer.toLowerCase()) ||
                         subAnswer.answer.toLowerCase().includes(answer.name.toLowerCase());

        if (nameMatch) {
         // console.log(`✅ Matched "${answer.name}" with breakdown sub-answer "${subAnswer.answer}"`);
        }
        return nameMatch;
      });

      if (matchingAnswer) {
        return matchingAnswer.id;
      }
    });
  }

  // METHOD 2: Try direct answer name matching from breakdown question
  if (breakdownItem.question) {
   // console.log(`🔍 Trying to match by question context:`, breakdownItem.question);

    // Extract answer names from the question context or use the entire answers array
    const matchingAnswer = answersOnScale.find(answer => {
      // Check if any answer name appears in the question or breakdown
      const questionContainsAnswer = breakdownItem.question.toLowerCase().includes(answer.name.toLowerCase());
      const hasMatchingSubAnswer = breakdownItem.answers.some(subAnswer =>
        subAnswer.answer.toLowerCase().includes(answer.name.toLowerCase())
      );

      return questionContainsAnswer || hasMatchingSubAnswer;
    });

    if (matchingAnswer) {
     // console.log(`✅ Question context match:`, matchingAnswer);
      return matchingAnswer.id;
    }
  }

  // METHOD 3: Fallback to index-based matching, but be more careful
  if (answersOnScale[index]) {
   // console.log(`🔄 Using fallback index matching for index ${index}:`, answersOnScale[index]);
    return answersOnScale[index].id;
  }

 // console.log(`❌ Could not extract answer ID for breakdown item`);
  return null;
};



  // Update the answer removal handler
  handleAnswerRemove = async (answerId) => {
    const { currentQuestion } = this.props.questionnaireReducer;
    const { allAnswersOnScale, selectedAnswersByQuestion,individualEnergies } = this.state;

    const answerToRemove = allAnswersOnScale.find(a => a.id === answerId);
    if (!answerToRemove || answerToRemove.questionIndex !== currentQuestion) {
      return;
    }

    // Remove from scale
    const newAllAnswersOnScale = allAnswersOnScale.filter(a => a.id !== answerId);

    // Remove from current question selection
    const currentAnswers = selectedAnswersByQuestion[currentQuestion] || [];
    const newCurrentAnswers = currentAnswers.filter(a => a.id !== answerId);
    const newSelectedAnswersByQuestion = {
      ...selectedAnswersByQuestion,
      [currentQuestion]: newCurrentAnswers
    };
      const newIndividualEnergies = { ...individualEnergies };
      delete newIndividualEnergies[answerId];


    this.setState({
      allAnswersOnScale: newAllAnswersOnScale,
      selectedAnswersByQuestion: newSelectedAnswersByQuestion,
      currentQuestionAnswers: newCurrentAnswers,
      individualEnergies: newIndividualEnergies,
      isAnimating: true
    }, async () => {
      this.saveState();
      await this.calculateTotalEnergy(); // This will update solarPanelCount
      this.setState({ isAnimating: false });
    });
  };

  getCurrentQuestion = () => {
    const { questionnaire, currentQuestion } = this.props.questionnaireReducer;
    return questionnaire.questions[currentQuestion] || null;
  };

// In KidsQuestionnaire component, update the canGoNext method:
canGoNext = () => {
  const { currentQuestion } = this.props.questionnaireReducer;
  const currentQuestionObj = this.getCurrentQuestion();
  const currentQuestionAnswers = this.state.selectedAnswersByQuestion[currentQuestion] || [];

  if (!currentQuestionObj) return false;

//console.log(`🔍 Checking if can go next from question ${currentQuestion}`);
//console.log(`🔍 Current answers for Q${currentQuestion}:`, currentQuestionAnswers.length);
//console.log(`🔍 Min required for Q${currentQuestion}:`, currentQuestionObj.minAnswersNumber);
//console.log(`🔍 Question is mandatory: ${currentQuestionObj.minAnswersNumber > 0}`);

  // Check if we have at least the minimum number of answers
  const hasMinimumAnswers = currentQuestionAnswers.length >= currentQuestionObj.minAnswersNumber;

  // Check if all selected answers have their variables filled (if they have variables)
  const hasAllVariablesFilled = currentQuestionAnswers.every(answer => {
    if (answer.variables && answer.variables.length > 0) {
      // Check if answer has variableValues and they're all filled
      if (answer.variableValues && answer.variableValues.length > 0) {
        const allFilled = answer.variableValues.every(variable =>
          variable.value !== undefined &&
          variable.value !== null &&
          variable.value !== '' &&
          variable.value !== 0
        );
      //console.log(`🔍 Answer ${answer.id} variables filled: ${allFilled}`);
        return allFilled;
      }
    //console.log(`🔍 Answer ${answer.id} has variables but no variableValues`);
      return false; // Has variables but no variableValues
    }
  //console.log(`🔍 Answer ${answer.id} has no variables - automatically filled`);
    return true; // No variables, so it's automatically filled
  });

//console.log(`🔍 Has minimum answers: ${hasMinimumAnswers}`);
//console.log(`🔍 Has all variables filled: ${hasAllVariablesFilled}`);

  const canProceed = hasMinimumAnswers && hasAllVariablesFilled;
//console.log(`🔍 Can proceed to next question: ${canProceed}`);

  return canProceed;
};

  // Remove the animation triggers from navigation
onClickNextButton = () => {
//console.log("🔄 NEXT button clicked");
//console.log("📊 Current state before navigation:");
//console.log("   Current question:", this.props.questionnaireReducer.currentQuestion);
//console.log("   All answers on scale:", this.state.allAnswersOnScale);
//console.log("   Selected answers by question:", this.state.selectedAnswersByQuestion);

  this.props.dispatch(nextPage());
  this.updateCurrentQuestionAnswers();

  // Log after navigation
  setTimeout(() => {
  //console.log("📊 State after navigation:");
  //console.log("   Current question:", this.props.questionnaireReducer.currentQuestion);
  //console.log("   canGoNext result:", this.canGoNext());
  }, 100);
};

onClickPreviousButton = () => {
//console.log("🔄 PREVIOUS button clicked");
//console.log("📊 Current state before navigation:");
//console.log("   Current question:", this.props.questionnaireReducer.currentQuestion);

  this.props.dispatch(previousPage());
  this.updateCurrentQuestionAnswers();

  // Log after navigation
  setTimeout(() => {
   //console.log("📊 State after navigation:");
   //console.log("   Current question:", this.props.questionnaireReducer.currentQuestion);
   //console.log("   canGoNext result:", this.canGoNext());
  }, 100);
};


//
//onClickSubmitButton = () => {
//  const { session } = this.props.answerReducer;
//  const answersOnScale = this.state.allAnswersOnScale;
//
//    const answersPayload = answersOnScale.map(answer => ({
//      possibleAnswer: { id: answer.id },
//      variableValues: answer.variableValues || []
//    }));
//
//
//  const tempSession = {
//    ...session,
//    answers: answersPayload
//  };
//
//  this.props.dispatch(seminarsGetRequest()).then(() => {
//    this.props.dispatch(sendSession(tempSession)).then(() => {
//      this.props.dispatch(showNavButton());
//      window.localStorage.setItem("currentPage", 0);
//
//      // CLEAR ALL STATE when finishing
//        localStorage.removeItem('kidsQuestionnaireState');
//
//        // Also clear component state to reset everything
//        this.setState({
//          allAnswersOnScale: [],
//          selectedAnswersByQuestion: {},
//          totalEnergy: 0,
//          currentQuestionAnswers: [],
//          draggedAnswer: null,
//          hasUserInteracted: false, // Reset interaction flag
//          individualEnergies: {},
//        });
//
//      // If you want to restart from question 0, dispatch restart
//      this.props.dispatch(restartQuestionnaire()); // Add this action if needed
//    });
//  });
//};

onClickSubmitButton = () => {
    const { session } = this.props.answerReducer;
    const answersOnScale = this.state.allAnswersOnScale;

    const answersPayload = answersOnScale.map(answer => ({
        possibleAnswer: { id: answer.id },
        variableValues: answer.variableValues || []
    }));

    const tempSession = {
        ...session,
        answers: answersPayload
    };

    // First send the session
    this.props.dispatch(sendSession(tempSession)).then(() => {
        this.props.dispatch(showNavButton());
        window.localStorage.setItem("currentPage", 0);

        // Validate seminar code if it exists
        if (session.seminar_access_code != null) {
            this.props.dispatch(validateSeminarCode(session.seminar_access_code))
                .then(() => {
                    const { isCodeValid, currentSeminarStatus } = this.props.seminarReducer;
                    if (isCodeValid && currentSeminarStatus) {
                        window.localStorage.setItem("currentSeminarStatus", currentSeminarStatus);
                    }
                })
                .catch(error => {
                    console.error("Error validating seminar code:", error);
                });
        }

        // CLEAR ALL STATE when finishing
        localStorage.removeItem('kidsQuestionnaireState');
        this.setState({
            allAnswersOnScale: [],
            selectedAnswersByQuestion: {},
            totalEnergy: 0,
            currentQuestionAnswers: [],
            draggedAnswer: null,
            hasUserInteracted: false,
            individualEnergies: {},
        });

        this.props.dispatch(restartQuestionnaire());
    });
};

  // Check if answer is on scale
  isAnswerOnScale = (answerId) => {
    return this.state.allAnswersOnScale.some(a => a.id === answerId);
  };

  // Check if answer can be selected in current question
  canSelectAnswer = (answer) => {
    const { currentQuestion } = this.props.questionnaireReducer;
    const { selectedAnswersByQuestion } = this.state;
    const currentQuestionObj = this.getCurrentQuestion();

    const currentAnswers = selectedAnswersByQuestion[currentQuestion] || [];

    // If already selected in current question, cannot select again
    if (currentAnswers.find(a => a.id === answer.id)) {
      return false;
    }

    // Check max answers limit
    if (currentAnswers.length >= currentQuestionObj.maxAnswersNumber) {
      return false;
    }

    return true;
  };

  // Check if answer can be deleted (only from current question)
    canDeleteAnswer = (answerId) => {
      const { currentQuestion } = this.props.questionnaireReducer;
      const answerOnScale = this.state.allAnswersOnScale.find(a => a.id === answerId);
      return answerOnScale && answerOnScale.questionIndex === currentQuestion;
    };


render() {
  const {
    questionnaire,
    currentQuestion,
    fetched,
    fetching
  } = this.props.questionnaireReducer;

  const { sessionId } = this.props.answerReducer;
  const { totalEnergy, currentQuestionAnswers, isAnimating, draggedAnswer,individualEnergies } = this.state;

  if (fetched && sessionId) {
    return <Redirect to={"/result/" + sessionId} />;
  }

  if (!fetched || fetching || !this.state.dataIsFetched) {
    return <div>Loading...</div>;
  }

  const currentQuestionObj = this.getCurrentQuestion();
  if (!currentQuestionObj) {
    return <div>No question available.</div>;
  }

  const questions = questionnaire.questions || [];
  const totalNbQuestion = questions.length;
  const progressBarValue = ((currentQuestion + 1) * 100) / totalNbQuestion;
  const allAnswersOnScale = this.getAllAnswersForScale();

  // Add key to ScaleDisplay to force re-render when question changes
  const scaleDisplayKey = `scale-${currentQuestion}-${allAnswersOnScale.length}`;
    const groupedAnswersOnScale = this.groupAnswersByQuestion(this.state.allAnswersOnScale);
  return (
    <Container fluid className="kids-questionnaire">
      {/* Progress Bar */}
      <Row className="mb-3">
        <Col>
          <ProgressBar now={progressBarValue} max={100} />
          <div className="text-center mt-1">
            Question {currentQuestion + 1} of {totalNbQuestion}
          </div>
        </Col>
      </Row>

      {/* Question Title */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-center kids-question-title">
            {currentQuestionObj.name}
          </h2>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="main-content-reversed">
        {/* Scale Area - Left - BIGGER */}
        <Col xl={8} lg={8} className="scale-area">
          <ScaleDisplay
            answers={allAnswersOnScale}
            groupedAnswers={groupedAnswersOnScale}
            onAnswerRemove={this.handleAnswerRemove}
            onAnswerDrop={this.handleAnswerDrop}
            totalEnergy={totalEnergy}
            isAnimating={isAnimating}
            currentQuestion={currentQuestion}
            canDeleteAnswer={this.canDeleteAnswer}
            solarPanelCount={this.state.solarPanelCount} // NEW PROP
             individualEnergies={individualEnergies}
          />
        </Col>

        {/* Answers Column - Right */}
        <Col xl={4} lg={4} className="answers-column">
          {/* Answers Container */}
          <div className="answers-container">
            <h4 className="answers-title">
              {this.isMobileDevice() ? "Tap answers to add them:" : "Drag answers to the scale:"}
            </h4>
            <div className={`answers-grid ${currentQuestionObj.possibleAnswers.length > 4 ? 'limited-rows' : ''}`}>
              {currentQuestionObj.possibleAnswers.map((answer) => (
                <AnswerBlock
                  key={answer.id}
                  answer={answer}
                  onDragStart={() => this.handleDragStart(answer)}
                  onAddToScale={this.handleAnswerAdd}
                  onClick={() => this.handleAnswerClick(answer)} // ADD THIS LINE
                  isOnScale={this.isAnswerOnScale(answer.id)}
                  canSelect={this.canSelectAnswer(answer)}
                  isAnimating={isAnimating}
                  isFromCurrentQuestion={true}
                  isMobile={this.isMobileDevice()} // ADD THIS LINE
                  isAvailableAnswer={true}
                />
              ))}
            </div>
          </div>

          {/* Energy Display - BELOW Answers */}
          <div className="energy-display-below">
            <div className="energy-total">
              Energy: <strong>{totalEnergy.toFixed(1)} <Trans i18nKey="new-changes.KwhD" /></strong>
            </div>
            <div className="energy-comparison">
              <small><Trans i18nKey="new-changes.EuropeAvg" /></small>
            </div>
            <div className="solar-panel-count">
              <small><Trans i18nKey="new-changes.SPs" /> {this.state.solarPanelCount} (1: 10 kWh)</small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation */}
      <Row className="navigation-buttons mt-4">
        <Col className="text-center">
          {this.renderPreviousButton()}
          {this.renderNextButton()}
          {this.renderSubmitButton()}
        </Col>
      </Row>
    </Container>
  );
}


// Add grouping method to KidsQuestionnaire:
groupAnswersByQuestion = (answers) => {
  const grouped = {};

  answers.forEach(answer => {
    const questionKey = `question-${answer.questionIndex}`;
    if (!grouped[questionKey]) {
      grouped[questionKey] = {
        questionIndex: answer.questionIndex,
        answers: []
      };
    }
    grouped[questionKey].answers.push(answer);
  });

  return grouped;
};


  renderPreviousButton() {
    const { currentQuestion } = this.props.questionnaireReducer;
    if (currentQuestion > 0) {
      return (
        <Button
          className="btn btn-secondary me-2"
          onClick={this.onClickPreviousButton}
          disabled={this.state.isAnimating}
        >
          <Trans i18nKey="questionnaire.previous" />
        </Button>
      );
    }
    return null;
  }

  renderNextButton() {
    const { currentQuestion, questionnaire } = this.props.questionnaireReducer;
    const questions = questionnaire.questions || [];

    if (currentQuestion < questions.length - 1) {
      const canGo = this.canGoNext();
     //console.log(`🔍 Next button - canGo: ${canGo}`);

      return (
        <Button
          className="btn btn-primary me-2"
          disabled={!canGo || this.state.isAnimating}
          onClick={this.onClickNextButton}
        >
          <Trans i18nKey="questionnaire.next" />
        </Button>
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { currentQuestion, questionnaire } = this.props.questionnaireReducer;
    const questions = questionnaire.questions || [];

    if (currentQuestion === questions.length - 1) {
      const canGo = this.canGoNext();
     //console.log(`🔍 Submit button - canGo: ${canGo}`);

      return (
        <Button
          className="btn btn-success"
          disabled={!canGo || this.state.isAnimating}
          onClick={this.onClickSubmitButton}
        >
          <Trans i18nKey="questionnaire.finish" />
        </Button>
      );
    }
    return null;
  }
}

export default KidsQuestionnaire;
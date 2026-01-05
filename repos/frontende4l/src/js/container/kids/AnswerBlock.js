import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { FormGroup, Input } from "reactstrap";
import Select from "react-select";
import '../../../css/KidsQuestionnaire2.css';
import { Trans } from "react-i18next";

const AnswerBlock = ({
  answer,
  onDragStart,
  onClick,
  isOnScale,
   onAddToScale,
  canSelect,
  isAnimating,
  isFromCurrentQuestion,
  dispatch,
  session,
   isAvailableAnswer = true
}) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [variableValues, setVariableValues] = useState({});
  const [isReadyForSelection, setIsReadyForSelection] = useState(false);
  const [hasVariables, setHasVariables] = useState(answer.variables && answer.variables.length > 0);

  // Initialize variable values
  useEffect(() => {
    if (hasVariables) {
      const initialValues = {};
      answer.variables.forEach(variable => {
        initialValues[variable.id] = '';
      });
      setVariableValues(initialValues);
    } else {
      setIsReadyForSelection(true);
    }
  }, [answer.variables, hasVariables]);

  // Check if all variables are filled
  useEffect(() => {
    if (!hasVariables) {
      setIsReadyForSelection(true);
      return;
    }

    // Check if all variables have valid values
    const allVariablesFilled = answer.variables.every(variable => {
      const value = variableValues[variable.id];

      // For count inputs (natural numbers), 0 is NOT considered filled
      const isCountInput = variable.label.toLowerCase().includes('number') ||
                          variable.label.toLowerCase().includes('count') ||
                          variable.label.toLowerCase().includes('how often') ||
                          answer.name.toLowerCase().includes('cat') ||
                          answer.name.toLowerCase().includes('dog') ||
                          answer.name.toLowerCase().includes('pet');

      if (isCountInput) {
        // For counts, value must be > 0
        return value !== undefined && value !== null && value !== '' && parseInt(value) > 0;
      } else {
        // For other inputs, any non-empty value is acceptable
        return value !== undefined && value !== null && value !== '' && value !== 0;
      }
    });

    setIsReadyForSelection(allVariablesFilled);

    // Log the readiness state for debugging
    //console.log(`🔒 Answer ${answer.id} ready for selection:`, allVariablesFilled);
    if (!allVariablesFilled) {
      answer.variables.forEach(variable => {
        const value = variableValues[variable.id];
        //console.log(`   Variable ${variable.id}:`, value, `valid:`, value && value !== '0' && value !== 0);
      });
    }
  }, [variableValues, hasVariables, answer.variables, answer.name, answer.id]);

  // Handle variable input changes
  const handleVariableChange = (variableId, value) => {
    //console.log(`Setting variable ${variableId} to:`, value, typeof value);
    setVariableValues(prev => ({
      ...prev,
      [variableId]: value
    }));
  };

  // FIXED: Create properly formatted variableValues for backend
  const getFormattedVariableValues = () => {
    if (!hasVariables) return [];

    return answer.variables.map(variable => {
      const rawValue = variableValues[variable.id];

      // Keep the value as-is (string for dropdowns/radio, number for numeric inputs)
      let formattedValue = rawValue;

      // For numeric inputs, try to convert to number but keep as string if it has decimals
      if (variable.scale.type.includes("IntervalScale")) {
        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue)) {
          // If it's a whole number, use number, otherwise keep as string for decimals
          formattedValue = Number.isInteger(numValue) ? numValue : rawValue;
        }
      }

      return {
        variable: { id: variable.id },
        value: formattedValue
      };
    });
  };

  // FIXED: Drag handler with proper data
  const handleDragStart = (e) => {
    if (!isReadyForSelection || !canSelect || isAnimating || isOnScale || !isFromCurrentQuestion) {
      e.preventDefault();
      return;
    }

    const formattedVariableValues = getFormattedVariableValues();

    const answerWithVariables = {
      ...answer,
      variableValues: formattedVariableValues
    };

    //console.log("🔄 Dragging answer with FULL DATA:", answerWithVariables);
    //console.log("🔄 variableValues:", answerWithVariables.variableValues);

    // Store the COMPLETE answer object in dataTransfer
    e.dataTransfer.setData("application/json", JSON.stringify(answerWithVariables));
    e.dataTransfer.setData("text/plain", answer.id);
    e.dataTransfer.effectAllowed = "copy";

    e.target.style.opacity = "0.6";
    onDragStart && onDragStart(answerWithVariables);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  // FIXED: Click handler with proper data
  const handleClick = () => {
    if (isMobile && isReadyForSelection && canSelect && !isAnimating && !isOnScale && isFromCurrentQuestion) {
      const formattedVariableValues = getFormattedVariableValues();

      const answerWithVariables = {
        ...answer,
        variableValues: formattedVariableValues
      };

      //console.log("📱 Tapping answer with variableValues:", answerWithVariables.variableValues);
      onClick && onClick(answerWithVariables);
    }
  };

  // Render variable inputs (same as before)
  const renderVariableInputs = () => {
    if (!hasVariables || isOnScale) return null;

    return (
      <div className="variable-inputs">
        {answer.variables.map((variable) => {
          if (variable.scale.type.endsWith("DiscreteScale")) {
            return renderDiscreteInput(variable);
          } else {
            return renderIntervalInput(variable);
          }
        })}
      </div>
    );
  };

  const renderDiscreteInput = (variable) => {
    const currentValue = variableValues[variable.id];

    if (variable.scale.allowedOptions.length > 2) {
      return (
        <FormGroup key={variable.id} className="variable-form-group">
          <label className="variable-label">{variable.label}</label>
          <Select
            className="basic-single"
            value={
              currentValue
                ? {
                    value: currentValue,
                    label: variable.scale.allowedOptions.find(opt => opt.value == currentValue).name || currentValue
                  }
                : null
            }
            isClearable={true}
            onChange={(selectedOption) => {
              const value = selectedOption ? selectedOption.value : '';
              handleVariableChange(variable.id, value);
            }}
            options={variable.scale.allowedOptions.map(option => ({
              value: option.value,
              label: option.name
            }))}
            placeholder={`Select ${variable.label}`}
          />
        </FormGroup>
      );
    } else {
      return (
        <FormGroup key={variable.id} className="variable-form-group">
          <label className="variable-label">{variable.label}</label>
          <div className="radio-options">
            {variable.scale.allowedOptions.map((option) => (
              <div key={option.id} className="radio-option">
                <input
                  type="radio"
                  id={`${answer.id}_${variable.id}_${option.id}`}
                  name={`${answer.id}_${variable.id}`}
                  value={option.value}
                  checked={currentValue == option.value}
                  onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                />
                <label htmlFor={`${answer.id}_${variable.id}_${option.id}`}>
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </FormGroup>
      );
    }
  };

  const renderIntervalInput = (variable) => {
    const currentValue = variableValues[variable.id];

      const isCountInput = variable.label.toLowerCase().includes('number') ||
                          variable.label.toLowerCase().includes('count') ||
                          variable.label.toLowerCase().includes('how often') ||
                          answer.name.toLowerCase().includes('cat') ||
                          answer.name.toLowerCase().includes('dog') ||
                          answer.name.toLowerCase().includes('pet');

      const isFilled = currentValue && currentValue !== '' && currentValue !== '0' && parseInt(currentValue) > 0;

    return (
      <FormGroup key={variable.id} className={`variable-form-group ${isCountInput ? 'count-input' : ''} ${isFilled ? 'filled' : ''}`}>
         <label className={`variable-label ${isCountInput ? 'count-required' : ''}`}>{variable.label}</label>
        <Input
          type="number"
          placeholder="0"
          min={isCountInput ? 0 : variable.scale.minValue}
          max={variable.scale.maxValue}
          step={isCountInput ? 1 : variable.scale.precision}
          value={currentValue || ''}
          onChange={(e) =>{
                    let value = e.target.value;

                    // For natural numbers, ensure we have whole numbers
                    if (value !== '') {
                                // For natural numbers, ensure we have whole numbers
                                if (isCountInput) {
                                  value = Math.floor(parseFloat(value)).toString();
                                  value = Math.max(0, parseInt(value) || 0).toString();
                                }

                                // Enforce maximum value
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && variable.scale.maxValue !== undefined) {
                                  if (numValue > variable.scale.maxValue) {
                                    value = variable.scale.maxValue.toString();
                                  }
                                }
                              }

                              //console.log(`Number input changed:`, value);
                              handleVariableChange(variable.id, value);
                            }}
          onBlur={(e) => {
                    if (e.target.value !== '') {
                                let value = e.target.value;

                                // Final validation
                                if (isCountInput) {
                                  value = Math.floor(parseFloat(value)).toString();
                                  value = Math.max(0, parseInt(value) || 0).toString();
                                }

                                // Final max check
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && variable.scale.maxValue !== undefined) {
                                  if (numValue > variable.scale.maxValue) {
                                    value = variable.scale.maxValue.toString();
                                  }
                                }

                                if (value !== e.target.value) {
                                  handleVariableChange(variable.id, value);
                                }
                              }
                            }}
        onKeyDown={(e) => {
                  // Prevent typing characters that would create invalid numbers
                  if (isCountInput) {
                    // Allow: numbers, backspace, delete, tab, arrow keys
                    if (!/[\d]|Backspace|Delete|Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/.test(e.key)) {
                      e.preventDefault();
                    }
                  }
                }}

        />
         <small className="variable-hint">
                {isCountInput
                  ? `Enter a whole number from 0 to ${variable.scale.maxValue}`
                  : `Range: ${variable.scale.minValue} - ${variable.scale.maxValue}`}
                {isCountInput && ' - Must be greater than 0'}
              </small>
      </FormGroup>
    );
  };

  const getBlockState = () => {
    if (isOnScale) return 'on-scale';
    if (!isReadyForSelection && hasVariables) return 'needs-input';
    if (!canSelect && isFromCurrentQuestion) return 'cannot-select';
    if (isAnimating) return 'animating';
    return '';
  };

   const renderAddButton = () => {
      // Only show for available answers (not ones already on scale)
      if (!isAvailableAnswer || isOnScale || !isFromCurrentQuestion) {
        return null;
      }

      return (
        <div className="add-to-scale-button-container">
          <button
            className="add-to-scale-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              //console.log(`➕ Add to scale button clicked for answer ${answer.id}`);
              //console.log(`🔍 Ready: ${isReadyForSelection}, CanSelect: ${canSelect}, Animating: ${isAnimating}`);

              if (!isReadyForSelection) {
                //console.log("❌ Not ready - variables not filled");
                return;
              }

              if (!canSelect) {
                //console.log("❌ Cannot select - max reached or other restriction");
                return;
              }

              if (isAnimating) {
                //console.log("❌ Currently animating");
                return;
              }

              // Prepare answer with variable values
              const formattedVariableValues = getFormattedVariableValues();
              const answerWithVariables = {
                ...answer,
                variableValues: formattedVariableValues
              };

              //console.log("➕ Prepared answer for scale:", answerWithVariables);

              // Call the dedicated add handler
              if (onAddToScale) {
                onAddToScale(answerWithVariables);
              } else if (onClick) {
                // Fallback to onClick for mobile compatibility
                onClick(answerWithVariables);
              } else {
                console.error("❌ No add handler provided");
              }
            }}
            disabled={!isReadyForSelection || !canSelect || isAnimating}
            title="Add to scale"
          >
            <span className="add-icon">+</span>
            <Trans i18nKey="new-changes.AddtoScale" />
          </button>
        </div>
      );
    };



  const blockState = getBlockState();

  return (
    <div
      className={`answer-block ${blockState} ${hasVariables ? 'has-variables' : ''} ${isAvailableAnswer ? 'available-answer' : 'on-scale-answer'}`}
      draggable={!isMobile && isReadyForSelection && canSelect && !isOnScale && isFromCurrentQuestion}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      /*onClick={handleClick}*/
    >
      <div className="answer-image-container">
        <img
          src={answer.image}
          alt={answer.name}
          className="answer-image"
        />

        {isOnScale && <div className="on-scale-indicator"><Trans i18nKey="new-changes.OneScale" /></div>}
        {!isFromCurrentQuestion && isOnScale && (
          <div className="from-previous-indicator"><Trans i18nKey="new-changes.FromQ" />{answer.questionIndex + 1}</div>
        )}
        {!isReadyForSelection && hasVariables && !isOnScale && (
          <div className="needs-input-indicator"><Trans i18nKey="new-changes.FillIn" /></div>
        )}
        {isOnScale && hasVariables && (
          <div className="on-scale-locked"><Trans i18nKey="new-changes.Lock" /></div>
        )}
      </div>

      <div className="answer-name">{answer.name}</div>

      {renderVariableInputs()}
        {renderAddButton()}
      {/* Status messages */}
{/*      {!canSelect && !isOnScale && isFromCurrentQuestion && isReadyForSelection && (
        <div className="cannot-select-message"><Trans i18nKey="new-changes.maxR" /></div>
      )}*/}

      {canSelect && isFromCurrentQuestion && isReadyForSelection && !isOnScale && (
        <div className="select-hint">
          {isMobile ? <Trans i18nKey="new-changes.tapScale" /> :  <Trans i18nKey="new-changes.dragToScale" /> }
        </div>
      )}

      {!isFromCurrentQuestion && isOnScale && (
        <div className="info-message"><Trans i18nKey="new-changes.goBack" />{answer.questionIndex + 1} to modify</div>
      )}

      {!isReadyForSelection && hasVariables && !isOnScale && (
        <div className="input-required-message">
         <Trans i18nKey="new-changes.pleaseFill" />
        </div>
      )}

      {isOnScale && hasVariables && (
        <div className="on-scale-message">
          <Trans i18nKey="new-changes.removeFrom" />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (store) => {
  return {
    session: store.answerReducer.session
  };
};

export default connect(mapStateToProps)(AnswerBlock);
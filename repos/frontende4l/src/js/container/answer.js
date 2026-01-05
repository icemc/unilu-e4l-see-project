import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  selectPossibleAnswer,
  unselectPossibleAnswer,
} from "../action/answerAction";
import { connect } from "react-redux";
import { Input } from "reactstrap";
import Select from "react-select";
import { FormGroup } from "react-bootstrap";
import { computeEnergy } from "../action/answerAction";
import { showNavButton } from "../action/navAction";
import {
  showMaxThresholdErrorMessage,
  hideMaxThresholdErrorMessage
} from "../action/questionnaireAction";
import '../../css/answer.css';

@connect((store) => {
  return {
    answerReducer: store.answerReducer,
    questionnaireReducer: store.questionnaireReducer,
  };
})
export class Answer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataIsFetched: false,
      energyFetched: false,
      data: null,
      isSmallScreen: !window.matchMedia("(min-width: 768px)").matches
    };
    this.onClick = this.onClick.bind(this);
  }
  componentWillMount() {

    document.documentElement.setAttribute("data-theme", this.props.questionnaireReducer.kid ? "kid" : "adult-invert");
    this.setState({ dataIsFetched: false });
    this.setState({ energyFetched: false });
    this.props.answerReducer.session.iskid = this.props.questionnaireReducer.kid;
    // const { session } = this.props.answerReducer;
  }

  componentDidMount() {
      this.props
          .dispatch(computeEnergy(this.props.answerReducer.session))
          .then((response) => {
              this.setState({
                  energyFetched: true,
                  dataIsFetched: true,
                  data: response,
              });
          });
      const handler = e => this.setState({isSmallScreen: !e.matches});
      window.matchMedia("(min-width: 768px)").addListener(handler);
  }

  onClick = () => {
    const { answers } = this.props.answerReducer.session;
    let selectability = this.props.selectability;
    window.localStorage.setItem("currentPage", 0);
    if (selectability == "selectable") {
      Promise.resolve(
        this.props.dispatch(selectPossibleAnswer(this.props.id, null))
      ).then(() =>
        this.props.dispatch(computeEnergy(this.props.answerReducer.session))
      );
    } else if (selectability == "selected") {
      this.props.dispatch(unselectPossibleAnswer(this.props.id, null));
    } else if (selectability == "binarySelectable") {
      //set of selected answers for this question
      let allPossibleAnswersInSelectedAnswers = answers.filter((item) =>
        this.props.currentQuestion.possibleAnswers
          .map((item) => item.id)
          .includes(item.possibleAnswer.id)
      );
      this.props.dispatch(
        unselectPossibleAnswer(
          allPossibleAnswersInSelectedAnswers[0].possibleAnswer.id
        ),
        false
      );
      Promise.resolve(
        this.props.dispatch(selectPossibleAnswer(this.props.id, null))
      ).then(() =>
        this.props.dispatch(computeEnergy(this.props.answerReducer.session))
      );
    }
  };

  onChange2 = (e) =>{
  const { answers } = this.props.answerReducer.session;
      let selectability = this.props.selectability;
      //set of selected answers for this question
      let allPossibleAnswersInSelectedAnswers = answers.filter((item) =>
        this.props.currentQuestion.possibleAnswers
          .map((item) => item.id)
          .includes(item.possibleAnswer.id)
      );
                       if (e.target.value == null || e.target.value == "" || e.target.value == 0) {
                           Promise.resolve(
                                   this.props.dispatch(unselectPossibleAnswer(this.props.id, null))
                                 ).then(() =>
                                   this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                                 );
                           }
                           else if (
                             selectability == "binarySelectable" &&
                             allPossibleAnswersInSelectedAnswers[0].possibleAnswer.id != this.props.id
                           ) {
                             this.props.dispatch(
                               unselectPossibleAnswer(
                                 allPossibleAnswersInSelectedAnswers[0].possibleAnswer.id,
                                 e.target.id
                               )
                             );
                             Promise.resolve(
                               this.props.dispatch(
                                 selectPossibleAnswer(this.props.id, {
                                   variable: { id: parseInt(e.target.id, 10) },
                                   value: parseInt(e.target.value),
                                 })
                               )
                             ).then(() =>
                               this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                             );
                           } else {
                             Promise.resolve(
                               this.props.dispatch(
                                 selectPossibleAnswer(this.props.id, {
                                   variable: { id: parseInt(e.target.id, 10) },
                                   value: e.target.value,
                                 })
                               )
                             ).then(() =>
                               this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                             );
                           }

  };


  onChange = (v, e) => {
    const { answers } = this.props.answerReducer.session;
    let selectability = this.props.selectability;
    //set of selected answers for this question
    let allPossibleAnswersInSelectedAnswers = answers.filter((item) =>
      this.props.currentQuestion.possibleAnswers
        .map((item) => item.id)
        .includes(item.possibleAnswer.id)
    );
       if (  e.target.value > v){
            this.props.dispatch(showMaxThresholdErrorMessage("The value should not be greater than "+v+"!"));
               }else{
                   this.props.dispatch(hideMaxThresholdErrorMessage());
                     if (e.target.value == null || e.target.value == "" || e.target.value == 0) {
                         Promise.resolve(
                                 this.props.dispatch(unselectPossibleAnswer(this.props.id, null))
                               ).then(() =>
                                 this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                               );
                         }
                         else if (
                           selectability == "binarySelectable" &&
                           allPossibleAnswersInSelectedAnswers[0].possibleAnswer.id != this.props.id
                         ) {
                           this.props.dispatch(
                             unselectPossibleAnswer(
                               allPossibleAnswersInSelectedAnswers[0].possibleAnswer.id,
                               e.target.id
                             )
                           );
                           Promise.resolve(
                             this.props.dispatch(
                               selectPossibleAnswer(this.props.id, {
                                 variable: { id: parseInt(e.target.id, 10) },
                                 value: e.target.value,
                               })
                             )
                           ).then(() =>
                             this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                           );
                         } else {
                           Promise.resolve(
                             this.props.dispatch(
                               selectPossibleAnswer(this.props.id, {
                                 variable: { id: parseInt(e.target.id, 10) },
                                 value: parseInt(e.target.value),
                               })
                             )
                           ).then(() =>
                             this.props.dispatch(computeEnergy(this.props.answerReducer.session))
                           );
                         }
                      }
  };




//                  <div
//                      className={selectability + " bg-white"}
//                      style={{ textAlign: "center", margin: 0 }}
//                      onClick={!hasVariables ? this.onClick.bind(this) : null}
//                      id={this.props.id}
//                      key={this.props.id}
//                  >

  render() {
    const dataFetched = this.props.questionnaireReducer.fetched;
    const dataFetching = this.props.questionnaireReducer.fetching;

    if (
      true
      //   this.state.dataIsFetched &&
      //   dataFetched &&
      //   !dataFetching &&
      //   this.state.data
    ) {
      let selectability = this.props.selectability;
      let answerVariables = this.props.variables;
      let logo = this.props.image;
      let inputField = <div></div>;
      if (answerVariables.length != 0) {
        inputField = this.renderInputGroup(answerVariables);
      }
      let hasVariables = this.props.variables.length != 0;
      if (this.state.isSmallScreen)
          return (
              <Col xs={12} className="padding ">
                  <div
                      className={`answer-tile ${selectability} ${hasVariables ? "has-vars" : ""}`}
                      style={{ textAlign: "center", margin: 0 }}
                      onClick={!hasVariables ? this.onClick.bind(this) : null}
                      id={this.props.id}
                      key={this.props.id}
                  tabIndex={0}
                  >
                      <Row className="justify-content-center">
                          <Col xs={5}>
                              <Row className="imageAnswersDiv padding">
                                  <img
                                      width="500"
                                      height="500"
                                      src={logo}
                                      className="imageAnswers"
                                  />
                              </Row>
                              <div>
                                  <b class="myBadult" >{this.props.name}</b>
                              </div>
                          </Col>
                          { hasVariables && <Col xs={7}>
                            {inputField}
                          </Col>}
                      </Row>
                  </div>
              </Col>
          );
      else
          return (
            <Col className="padding ">
                  <div
                      className={`answer-tile ${selectability} ${hasVariables ? "has-vars" : ""}`}
                      style={{ textAlign: "center", margin: 0 }}
                      onClick={!hasVariables ? this.onClick.bind(this) : null}
                      id={this.props.id}
                      key={this.props.id}
                  tabIndex={0}
                  >
                <Row className="imageAnswersDiv padding">
                  <img
                    width="500"
                    height="500"
                    src={logo}
                    className="imageAnswers"
                  />
                </Row>
                <div>
                  <b class="myBadult">{this.props.name}</b>
                </div>
                {inputField}
              </div>
            </Col>
          );
    } else {
      return <div></div>;
    }
  }

  renderInputGroup = (answerVariables) => {
    const { answers } = this.props.answerReducer.session;
    //set of selected answers for this question
    if (answerVariables[2] != null && answerVariables[2].name == "type"){
        let lastItem = answerVariables.pop(); // Remove the last item
        answerVariables.unshift(lastItem); // Add it to the start of the array
    }
    let possibleAnswerInSelectedAnswers = answers.filter(
      (item) => item.possibleAnswer.id == this.props.id
    );
    let value = "";

    return (
      <form className=" padding">
        {answerVariables.map((item) => {
          if (
            possibleAnswerInSelectedAnswers.length > 0 &&
            possibleAnswerInSelectedAnswers[0].variableValues != null
          ) {
            let variableInSelectedAnswers = possibleAnswerInSelectedAnswers[0].variableValues.filter(
              (item2) => item2.variable.id == item.id
            );
            if (variableInSelectedAnswers.length > 0) {
              value = variableInSelectedAnswers[0].value;
            } else {
              value = "";
            }
          }
          if (item.scale.type.endsWith("DiscreteScale")) {
                return this.renderInputDiscrete(item, value);
          } else {
            return this.renderInputInterval(item, value);
          }
        })}
      </form>
    );
  };

  renderInputDiscrete = (variable, value) => {
    if(variable.scale.allowedOptions.length >2){
    return (
      <FormGroup>
        <label
          htmlFor={variable.id}
          className="control-label"
          style={{ textAlign: "left", display: "block", color:"black" }}
        >
          {variable.label}
        </label>
        <Select
          className="basic-single selectE4l clearable"
          value={
            !value
              ? ""
              : variable.scale.allowedOptions
                  .filter((item) => item.value == value)
                  .map((item) => {
                    return {
                      value: item.value,
                      label: item.name,
                    };
                  })[0]
          }
          isClearable={true}
          onChange={(v, e) =>
            this.onChange2({
              target: { value: v ? v.value : v, id: variable.id },
            })
          }
          key={variable.id}
          options={variable.scale.allowedOptions.map((item) => {
            return {
              value: item.value,
              label: item.name,
            };
          })}
        />
      </FormGroup>
    );}
    else{
    return (
        <FormGroup>
            <label
                htmlFor={variable.id}
                className="control-label"
                style={{ textAlign: "left", display: "block" , color:"black"}}
            >
                {variable.label}
            </label>
            {variable.scale.allowedOptions.map((option) => (
                <div key={option.name}>
                    <input
                        type="radio"
                        id={option.id}
                        name={variable.name}
                        value={option.value}
                        checked={value == option.value}
                        onChange={(e) => this.onChange2({ target: { value: e.target.value, id: variable.id } })}
                    />
                    <label htmlFor={`${variable.id}_${option.name}`} style={{ marginLeft: '5px' , color:"black"}}>{option.name}</label>
                </div>
            ))}
        </FormGroup>
    );
    }
  };

  renderInputInterval = (variable, value) => {
    return (
      <FormGroup>
        <label htmlFor={variable.id} className="control-label float-left myBadult">
          {variable.label}
        </label>
        <Input type="number"
          placeholder="0"
          min={variable.scale.minValue}
          max={variable.scale.maxValue}
          //type="number"
          step={variable.scale.precision}
         onChange={(e) => this.onChange(variable.scale.maxValue, e)}
         //onChange={this.onChange}
          id={variable.id}
          key={variable.id}
          value={value}
        />
      </FormGroup>
    );
  };
}

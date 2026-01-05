import React from "react";

import lux_logo from "../../public/img/lux.svg";
import e4l_users_logo from "../../public/img/group_users_e4l.svg";
import europe_logo from "../../public/img/europe.svg";
import world_logo from "../../public/img/world.svg";
import l from "../../public/img/lux.png";
import e from "../../public/img/group_users_e4l.png";
import e1 from "../../public/img/europe.png";
import w1 from "../../public/img/world.png";
import u from "../../public/img/user.png";
import qrcode from "../../public/img/qrcodewebsite.png";
import { Col, Row, Button, Modal,Alert, Card, Form,Container } from "react-bootstrap";
import { connect } from "react-redux";
import exampleImage from "../../public/img/user.svg";
import { VerticalSpace } from "../presentation/verticalSpace";
import { MDBBtn, MDBIcon } from "mdbreact";
import { Textfit } from "react-textfit";
import { Trans } from "react-i18next";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import i18n from "../i18n";
import { fetchResult } from "../action/answerAction";
import { Link } from "react-router-dom";
const Plot = window.createPlotlyComponent.default(Plotly);
import {Pie} from "react-chartjs-2";
import 'chart.piecelabel.js';
import LandCalculator from "./landCalculator";
import uni_logo from "../../public/img/uni-lu-logo.svg";
import '../../css/results.css'; // Assuming you have an App.css file for styling
import "bootstrap/dist/css/bootstrap.css";
import {sendMessageWithPdf} from "../action/contactAction";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BatteryLoading from './resultBatteryLoading'; // or SimpleBatteryLoading
import { hideNavButton, showNavButton } from "../action/navAction";

@connect((store) => {
  return {
    questionnaireReducer: store.questionnaireReducer,
    answerReducer: store.answerReducer,
    userReducer: store.userReducer,
    contactReducer: store.contactReducer,
  };
})

export class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     imageSources: {
          e4l_users: e4l_users_logo, // SVG initially
          europe: europe_logo,
          world: world_logo,
          example: exampleImage,
          lux: lux_logo,
        },
      show: false,
      sent:false,
      isSmallScreen: !window.matchMedia("(min-width: 768px)").matches,
      first_name: "",
      last_name: "",
      email: "",
      subject: "",
      message: "",
      consensus: false,
      formValidated: false,
      submitted: false,
      loading: true, // Add loading state
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }
     handleShow = () => {
          this.setState({ show: true });
       };

    handleClose = () => {
       this.setState({ show: false });
     };

  componentWillMount() {
    const { sessionId } = this.props.match.params;
    this.setState({ loading: true }); // Set loading to true when starting to fetch

      // Simulate loading for testing - remove this in production
/*      if (true) {
        console.log('Testing loading animation...');
        this.testLoadingAnimation();
      } else {
        this.props.dispatch(fetchResult(sessionId));
      }*/

    this.props.dispatch(fetchResult(sessionId));
  }

/*
  // Add this method for testing
  testLoadingAnimation = () => {
    // Simulate 3 seconds loading time
    setTimeout(() => {
      console.log('Loading simulation complete');
      this.setState({ loading: false });

      // You can also simulate having data for further testing
      // this.props.dispatch({ type: 'TEST_DATA_LOADED' });
    }, 10000);
  };
*/


    componentDidMount() {
        this.setState({...this.state, submitted: false, formValidated: false})
    }

    componentDidUpdate(prevProps) {
      // Check if results have been loaded
      if (prevProps.answerReducer.calculationResult !== this.props.answerReducer.calculationResult) {
        if (this.props.answerReducer.calculationResult || this.props.answerReducer.error) {
          this.setState({ loading: false });
        }
      }
        document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false"?  "adult-invert": "kid");
        this.props.dispatch(showNavButton());

    }

handlePrint = () => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    const dateOnly = now.toLocaleDateString();

    document.getElementById('print-timestamp').textContent = `⏱ ${timestamp}`;

    const originalTitle = document.title;

    document.title = `E4L Energy Score(${dateOnly})`;

    window.print();

    setTimeout(() => {
        document.title = originalTitle;
    }, 100);
};



swapToPng = () => {
  this.setState({
    imageSources: {
      e4l_users: "../../public/img/group_users_e4l.png",
      europe: "../../public/img/europe.png",
      world: "../../public/img/world.png",
      example: "../../public/img/user.png",
      lux: "../../public/img/lux.png",
    },
  });
};

revertToSvg = () => {
  this.setState({
    imageSources: {
      e4l_users: e4l_users_logo,
      europe: europe_logo,
      world: world_logo,
      example: exampleImage,
      lux: lux_logo,
    },
  });
};


toggleNoPrintElements = (toshow) => {
  const noPrintElements = document.querySelectorAll('.no-print');
  noPrintElements.forEach(elem => {
    elem.style.display = toshow ? '' : 'none';
  });
}

changePlots = (toshow) => {
  const cardBodyElements = document.querySelectorAll('.card-body');
  cardBodyElements.forEach(elem => {
    elem.style.width = toshow ? '1115px' : '';
  });
}

addTimestamp = () => {
 // Ensure this is the correct ID
 const inputs = document.querySelectorAll('#header'); // Use class if possible, or ensure ID uniqueness
   inputs.forEach(input => {
  const headerDiv = document.createElement('div');
  headerDiv.id = 'custom-header';

  // Create the logo element
  const logoDiv = document.createElement('div'); // Container for logo and text
  const logoImg = document.createElement('img');
  logoImg.src = uni_logo; // Replace with the path to your logo
  logoImg.style.width = '6em'; // Adjust size as needed

  // Create the text "Energy4Life"
  const logoText = document.createElement('span');
  logoText.textContent = 'Energy4Life';
  logoText.style.display = 'block'; // Ensure it's on a new line
  logoText.style.textAlign = 'center'; // Center the text below the logo

  logoDiv.appendChild(logoImg);
  logoDiv.appendChild(logoText);

  const timestampDiv = document.createElement('div');
  timestampDiv.id = 'timestamp';
  const now = new Date();
  timestampDiv.textContent = `⏱: ${now.toLocaleString()}`;
  timestampDiv.style.textAlign = 'center';
  headerDiv.style.marginRight = '50px';
  headerDiv.style.marginLeft = '50px';
  headerDiv.appendChild(logoDiv);
  headerDiv.appendChild(timestampDiv);
  headerDiv.style.display = 'flex';
  headerDiv.style.alignItems = 'center';
  headerDiv.style.justifyContent = 'space-between';
  headerDiv.style.marginBottom = '1px';
  headerDiv.style.marginTop = '-5px';

    input.prepend(headerDiv);
    });
};

removeCustomHeader = () => {
  const headerDiv = document.getElementById('custom-header');
  if (headerDiv) {
    headerDiv.remove();
  }
};


returnEverything = () =>{
      this.toggleNoPrintElements(true);
      this.removeCustomHeader();
      this.revertToSvg();
      this.changePlots(false);
      this.togglePrintVersion(false);
};


togglePrintVersion = (isPrinting) => {
  const screenPlot = document.querySelectorAll('.plot-screen');
  const printPlot = document.querySelectorAll('.plot-print');
  const printdop = document.querySelector('.page-print_dop');
  if (isPrinting) {
      screenPlot.forEach(elem => {
        elem.style.display = 'none';
      });
      printPlot.forEach(elem => {
        elem.style.display = 'block';
      });
      if(window.matchMedia("(min-width: 768px)").matches){
            printdop.style.display = 'block';
            }
  } else {
     screenPlot.forEach(elem => {
       elem.style.display = 'block';
     });
     printPlot.forEach(elem => {
       elem.style.display = 'none';
     });
      printdop.style.display = 'none';
  }
};



applyPrintStyles = () => {
  const content = document.getElementById('content-to-print');

  // Store the original styles so they can be reverted later
  const originalStyles = {
    width: content.style.width,
    transform: content.style.transform,
    transformOrigin: content.style.transformOrigin
  };

  // Apply a fixed width and scaling transformation to emulate desktop width
  content.style.width = '1170px'; // Use the width of your desktop layout
  content.style.transform = 'scale(1)';
  content.style.transformOrigin = 'top left';

  return originalStyles;
};

resetStyles = (originalStyles) => {
  const content = document.getElementById('content-to-print');
  // Reset the content styles to their original values
  content.style.width = originalStyles.width;
  content.style.transform = originalStyles.transform;
  content.style.transformOrigin = originalStyles.transformOrigin;
};


handleGeneratePdf = () => {
return new Promise((resolve, reject) => {
  // Swap SVG sources to PNG
    this.swapToPng();
    this.changePlots(true);
    this.togglePrintVersion(true);
    setTimeout(() => {
    this.addTimestamp();
    this.toggleNoPrintElements(false);
  const originalStyles = this.applyPrintStyles();
  const input = document.getElementById('content-to-print'); // Target specific content
  html2canvas(input, { scale: 1 }) // Reduced scale
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.5); // Use JPEG format with quality
            // Set the dimensions for the PDF
            const pdfWidth = 212; // The width in mm of the PDF content area
            const pdfHeight = canvas.height * pdfWidth / canvas.width; // Calculate the height in mm

            // Initialize jsPDF with a very tall custom page size
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: [pdfWidth, pdfHeight]
            });

            // Add the image to the single page PDF
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            // Save the PDF
//            pdf.save("download.pdf");
            var blobPDF = new Blob([pdf.output('blob')], { type: 'application/pdf' });

            resolve(blobPDF);


      this.returnEverything();
      this.resetStyles(originalStyles);
     }).catch(error => {
           console.error('Error during PDF generation', error);
           this.returnEverything();
         })
         .finally(() => {
              this.returnEverything();

         });
         }, 100);
     document.body.classList.remove('print-mode');
     });
}


    handleConsensusChange = (event) => {
        this.setState({...this.state, consensus: !this.state.consensus})
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    };

    handleSend = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({...this.state, formValidated: true});
            return
        }
        this.state.sent = true;
        this.handleGeneratePdf().then((pdfBlob) => {
                if (pdfBlob instanceof Blob) {
                    const formData = new FormData();
                    formData.append('firstName', this.state.first_name);
                    formData.append('lastName', this.state.last_name);
                    if (this.props.userReducer.user != null){formData.append('email', this.props.userReducer.user.email);}
                    else{ formData.append('email', this.state.email);}
                    formData.append('pdf', pdfBlob, 'document.pdf');
                    this.props.dispatch(sendMessageWithPdf(formData));
                    this.setState({ submitted: true });
                } else {
                  console.log("beee")
                }
            });
    };

  render() {
    const plotStyles = this.state.printMode ? {
      width: "100%",
      height: "auto",
      maxWidth: "none",
      transform: "scale(2)",
      transformOrigin: "top left"
    } : {
      width: "3000px",
      height: "500px"
    };
    const { calculationResult, error } = this.props.answerReducer;


  // Show loading animation while fetching data
      if (this.state.loading) {
        return (
          <div className="container containerE4l">
            <BatteryLoading />
          </div>
        );
      }


    if (!calculationResult)
      return (
        <div className="container containerE4l">
          {error && (
            <div className="alert alert-danger">
              <h5 className="alert-heading">{error.message}</h5>
              {error.response && error.response.data.message}
            </div>
          )}
        </div>
      );

   let data = {
               labels : calculationResult.situations.map(e => e),
               datasets : [{
               label:'scores',
               data : calculationResult.scores.map(e => e),
               backgroundColor : calculationResult.colors.map(e => e),
               }]};

    let scores = {};
    scores[i18n.t("result.you")] = calculationResult.result.toFixed(0);
    scores[i18n.t("result.average_scores")] = calculationResult.avgScores;
    scores[i18n.t("result.luxembourg")] = 206;
    scores[i18n.t("result.europe")] = 102;
    scores[i18n.t("result.world")] = 62;

    let plot = {
      x: Object.keys(scores),
      y: Object.values(scores),
    };

 let totalScores = {
      10   : "(blank)",
      30 : calculationResult.clusters[0],
      50 : calculationResult.clusters[1],
      70 : calculationResult.clusters[2],
      90 : calculationResult.clusters[3],
      110 : calculationResult.clusters[4],
      130 : calculationResult.clusters[5],
      150 : calculationResult.clusters[6],
      170 : calculationResult.clusters[7],
      190 : calculationResult.clusters[8],
      210 : calculationResult.clusters[9],
      230 : calculationResult.clusters[10],
      250 : calculationResult.clusters[11],
      270 : calculationResult.clusters[12],
      290 : calculationResult.clusters[13],
      310 : calculationResult.clusters[14],
    };
    // Since Local version does not have a lot of questionnaires done, example case has been created
// let totalScores = {
//      10   : "(blank)",
//      30 : 0,
//      50 : 22,
//      70 : 29,
//      90 : 134,
//      110 : 198,
//      130 : 200,
//      150 : 310,
//      170 : 247,
//      190 : 130,
//      210 : 75,
//      230 : 38,
//      250 : 23,
//      270 : 17,
//      290 : 6,
//      310 : 25,
//    };

    let plot2 = {
         y: Object.values(totalScores),
         x: Object.keys(totalScores),
        };

    let maxres =0  // if you check example put here the max value
    for( let i of calculationResult.clusters){ if( i > maxres){ maxres = i}}

    let s = {
    0 : calculationResult.result >300 ? 315 : calculationResult.result,
    //  21 :  calculationResult.result,
    };
    // the value for the strip is added separately
    s[maxres + maxres/25] = calculationResult.result >300 ? 315 : calculationResult.result;

   let plot3 = {
    y: Object.keys(s),
    x: Object.values(s),
    };

    const detailsFile = "https://www.cambridgeenglish.org/images/young-learners-sample-papers-2018-vol1.pdf"

 return (
      <React.Fragment>
        <div className="container containerE4l reverse">
        <div id="content-to-print">
          <div className="card reverse">
            <div className="card-header text-center reverse">
               <h3>
              <Trans i18nKey="result.visual_comparision" />
                </h3>
            </div>
           <div className="card-body plot-print reverse"  style={{ margin: '0px', padding: "0px",display:"none"}} >
                <p style={{ textAlign: "center",fontFamily: 'sans-serif',padding:"30px"}}>
        This PDF has been automatically generated by our platform to provide a visual representation of your performance metrics.
        For easy access and sharing, you can scan the QR code included.                <img src={qrcode}  style={{marginLeft:"50px",width:"100px"}}/>
                    </p>
           </div>
            <div className="show error message reverse"
            style={{color: 'red', padding: "20px", display: "flex", justifyContent: "center",alignItems: "center", width: "100%" }}>
            {window.localStorage.getItem("currentSeminarStatus")==='CLOSED' && (<Trans i18nKey="seminar.results.user.errorClosed" />)}
            {window.localStorage.getItem("currentSeminarStatus")==='TODO' && (<Trans i18nKey="seminar.results.user.errorTodo" />)}
            {window.localStorage.getItem("currentSeminarStatus")==='CANCELLED' && (<Trans i18nKey="seminar.results.user.errorCancelled" />)}
            </div>
            <div  id = "header" className="card-body reverse">
             <h5 style={{ marginTop: '20px', marginBottom: '50px', textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
               <Trans i18nKey="result.logo_title" />
               </h5>
              <Row>
                  <Col>
                  <div>
                    <img src={this.state.imageSources.example} className="logo-scores" />
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h6>
                        <Trans i18nKey="result.your_result" />
                      </h6>
                    </Textfit>

                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h5>
                        <Trans
                          i18nKey="result.kwh_day"
                          values={{ result: calculationResult.result.toFixed(0) }}
                        />
                      </h5>
                    </Textfit>
                  </div>
                </Col>
                <Col>
                 <div>
                 <img src={this.state.imageSources.e4l_users} className="logo-scores" />
                 <Textfit
                  mode="single"
                  style={{ margin: "auto", textAlign: "center" }}
                  forceSingleModeWidth={false}
                   >
                   <h6>
                     <Trans i18nKey="result.average_scores" />
                   </h6>
                    </Textfit>
                     <Textfit
                       mode="single"
                        style={{ margin: "auto", textAlign: "center" }}
                         forceSingleModeWidth={false}
                              >
                            <h5>
                            <Trans
                          i18nKey="result.kwh_day"
                           values={{ result: calculationResult.avgScores}}
                           />
                         </h5>
                         </Textfit>
                          </div>
                         </Col>
                 <Col>
             <div>
                 <img src={this.state.imageSources.lux} className="logo-scores" />
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h6>
                        <Trans i18nKey="result.luxembourg_avg" />
                      </h6>
                    </Textfit>
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h5>
                        <Trans
                          i18nKey="result.kwh_day"
                          values={{ result: scores[i18n.t("result.luxembourg")] }}
                        />
                      </h5>
                    </Textfit>
                  </div>
                </Col>
                <Col>
                  <div>
                    <img src={this.state.imageSources.europe} className="logo-scores" />
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h6>
                        <Trans i18nKey="result.europe_avg" />
                      </h6>
                    </Textfit>
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h5>
                        <Trans
                          i18nKey="result.kwh_day"
                          values={{ result: scores[i18n.t("result.europe")] }}
                        />
                      </h5>
                    </Textfit>
                  </div>
                </Col>
                <Col>
                  <div>
                    <img src={this.state.imageSources.world} className="logo-scores" />
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h6>
                        <Trans i18nKey="result.world_avg" />
                      </h6>
                    </Textfit>
                    <Textfit
                      mode="single"
                      style={{ margin: "auto", textAlign: "center" }}
                      forceSingleModeWidth={false}
                    >
                      <h5>
                        <Trans
                          i18nKey="result.kwh_day"
                          values={{ result: scores[i18n.t("result.world")] }}
                        />
                      </h5>
                    </Textfit>
                  </div>
                </Col>
              </Row>
            </div>
          </div>



      <div className="card-body page-print_dop reverse" style={{ minHeight: "70px",display: 'none'}}> </div>
        <div className="card page-break reverse">
          <div className="card-body plot-screen reverse" style={{ minHeight: "500px",display: 'block'}}>
            <h5 style={{ textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
             <Trans i18nKey="result.comparison_chart_title" />
             </h5>
              <Row>
                <Plot
                  style={{ width: "3000px", height: "500px"}}
                  data={[
                    {
                      type: "bar",
                      x: plot.x,
                      y: plot.y,
                      hoverinfo: "text",
                      text: plot.y.map(String),
                      textposition: "auto",
                      marker: {
                        color: ["#187cf7", "#1c467a","#1c467a", "#1c467a", "#1c467a"],
                      },
                    },
                  ]}
                   config={{
                    responsive: true,
                    displayModeBar: false,
                    staticPlot: true,
                  }}
                />
             </Row>
          </div>


          <div className="card-body plot-print reverse" style={{ width:"1120px", minHeight: "500px", display: 'none'}}>
                      <h5 style={{ textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
                       <Trans i18nKey="result.comparison_chart_title" />
                       </h5>
                        <Row>
                          <Plot
                            style={{ width: "1120px", height: "500px"}}
                            data={[
                              {
                                type: "bar",
                                x: plot.x,
                                y: plot.y,
                                hoverinfo: "text",
                                text: plot.y.map(String),
                                textposition: "auto",
                                marker: {
                                  color: ["#187cf7", "#1c467a","#1c467a", "#1c467a", "#1c467a"],
                                },
                              },
                            ]}
                             config={{
                              responsive: true,
                              displayModeBar: false,
                              staticPlot: true,
                            }}
                          />
                       </Row>
                    </div>
        </div>

       <div className="card  plot-screen reverse"  style={{ display: 'block'}}>
           <h5 style={{ textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
            <Trans i18nKey="result.pie_chart_title" />
            </h5>

         <Pie data={data}
          height={130} width={350}
                 options={{
                 legend: {
                    display: window.matchMedia("(min-width: 768px)").matches,
                    position: 'left'
                 },
                 title: {
                             display: true,
                             text: calculationResult.note,
                             fontColor: 'red',
                              fontSize: 15
                         },
                   pieceLabel: {
                    render: 'value',
                    position: 'top',
                    fontColor: 'white'
                 }
                 }}
           />
       </div>
      <div className="card plot-print reverse" style={{ width:"1120px", minHeight: "500px", display: 'none'}}>
                  <h5 style={{ textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
                   <Trans i18nKey="result.pie_chart_title" />
                   </h5>

                <Pie data={data}
                 height={130} width={350}
                        options={{
                        legend: {
                           display: true,
                           position: 'left'
                        },
                        title: {
                                    display: true,
                                    text: calculationResult.note,
                                    fontColor: 'red',
                                     fontSize: 15
                                },
                          pieceLabel: {
                           render: 'value',
                           position: 'top',
                           fontColor: 'white'
                        }
                        }}
                  />
      </div>
          <div className="card page-break reverse">
                 <div className="card-body plot-screen reverse" style={{minHeight: "500px", display: 'block'}}>
                      <h5 style={{ marginTop: '20px',textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
                        <Trans i18nKey="result.distribution_chart_title" />
                       </h5>
                       <Row>
                          <Plot
                            style={{ width: "3000px", height: "500px" }}
                            data={[
                              {
                                type: "bar",
                                x: plot2.x,
                                y: plot2.y,
                                name: i18n.t("result.e4l_users"),
                                hoverinfo: "text",
                                text: plot2.y.map(String),
                                textposition: "auto",
                                marker: {
//                                  color: ["#1c467a", "#1c467a","#1c467a", "#1c467a", "#1c467a","#1c467a","#1c467a","#1c467a","#1c467a","#1c467a","#1c467a",
//                                "#1c467a","#1c467a","#1c467a","#1c467a","#1c467a"],
                                   color: "#1c467a",
                                   size: 10,
                                  opacity: 1,
                                  line: {
                                        width: 1
                                      }
                                },
                              },
                             {
                                  type: "scatter",
                                  x: plot3.x,
                                  y: plot3.y,
                                  name: i18n.t("result.you"),
                                  marker: {
                                  color: 'red',
                                  opacity: 2,
                                  line: {
                                  width: 3,
                                  color: 'red'
                                   }
                                   },
                                   },
                            ]}
                             layout={{
                            annotations: [
                                     {
                                        x: calculationResult.result >300 ? 315 : calculationResult.result,
                                        // formula for "You" display
                                        y: maxres + maxres/12,
                                        text: '<b> ' + i18n.t("result.you") + ' </b>',
                                        font: {
                                          color: "red",
                                           size: 14,
                                         },
                                        xref: 'x',
                                        yref: 'y',
                                        showarrow: false,
                                         },

//                                        /*{
//                                        x: 0,
//                                        y: -1,
//                                        text: [...Array(16)].map((_, index) => (index + 1) * 20),
//                                        textposition: 'bottom',
//                                        xref: 'x',
//                                        yref: 'y',
//                                        showarrow: false,
//                                          }*/

                                      ],
                                  xaxis: {
                                      title: {
                                        text: i18n.t("result.e4l_users"),
                                        font: {
                                          family: 'sans-serif',
                                          size: 18,
                                          color: 'black',
                                        }
                                      },
                                      dtick: 20,
                                      range: [0, 320],
                                      tickmode: 'array',
                                      tickvals: [20,40,60,80,100,120,140,160,180,200,220,240,260, 280, 300, 320],
                                      ticktext: [20,40,60,80,100,120,140,160,180,200,220,240,260, 280, 300, '...'],
                                    },

                                    yaxis: {
                                      title: {
                                        text: i18n.t("result.number_people"),
                                        font: {
                                          family: 'sans-serif',
                                          size: 18,
                                          color: 'black'
                                        }
                                      },
                                      ////////////////////////////////////////////////////// FORMULA
                                          // distribution to 5 rows
                                          dtick: Math.round(Math.round(maxres/5)/10)*10,
                                          gridwidth: 1
                                    }
                            }}
                            config={{
                              responsive: true,
                              displayModeBar: false,
                              staticPlot: true,
                            }}
                          />
                        </Row>
                      </div>

               <div className="card-body plot-print reverse" style={{ width:"1120px", minHeight: "500px", display: 'none'}}>
                                     <h5 style={{ marginTop: '20px',textAlign: "center",fontFamily: 'sans-serif',fontWeight: "bold"}}>
                                       <Trans i18nKey="result.distribution_chart_title" />
                                      </h5>
                                      <Row>
                                         <Plot
                                           style={{ width: "1120px", height: "500px" }}
                                           data={[
                                             {
                                               type: "bar",
                                               x: plot2.x,
                                               y: plot2.y,
                                               name: i18n.t("result.e4l_users"),
                                               hoverinfo: "text",
                                               text: plot2.y.map(String),
                                               textposition: "auto",
                                               marker: {
               //                                  color: ["#1c467a", "#1c467a","#1c467a", "#1c467a", "#1c467a","#1c467a","#1c467a","#1c467a","#1c467a","#1c467a","#1c467a",
               //                                "#1c467a","#1c467a","#1c467a","#1c467a","#1c467a"],
                                                  color: "#1c467a",
                                                  size: 10,
                                                 opacity: 1,
                                                 line: {
                                                       width: 1
                                                     }
                                               },
                                             },
                                            {
                                                 type: "scatter",
                                                 x: plot3.x,
                                                 y: plot3.y,
                                                 name: i18n.t("result.you"),
                                                 marker: {
                                                 color: 'red',
                                                 opacity: 2,
                                                 line: {
                                                 width: 3,
                                                 color: 'red'
                                                  }
                                                  },
                                                  },
                                           ]}
                                            layout={{
                                           annotations: [
                                                    {
                                                       x: calculationResult.result >300 ? 315 : calculationResult.result,
                                                       // formula for "You" display
                                                       y: maxres + maxres/12,
                                                       text: '<b> ' + i18n.t("result.you") + ' </b>',
                                                       font: {
                                                         color: "red",
                                                          size: 14,
                                                        },
                                                       xref: 'x',
                                                       yref: 'y',
                                                       showarrow: false,
                                                        },

               //                                        /*{
               //                                        x: 0,
               //                                        y: -1,
               //                                        text: [...Array(16)].map((_, index) => (index + 1) * 20),
               //                                        textposition: 'bottom',
               //                                        xref: 'x',
               //                                        yref: 'y',
               //                                        showarrow: false,
               //                                          }*/

                                                     ],
                                                 xaxis: {
                                                     title: {
                                                       text: i18n.t("result.e4l_users"),
                                                       font: {
                                                         family: 'sans-serif',
                                                         size: 18,
                                                         color: 'black',
                                                       }
                                                     },
                                                     dtick: 20,
                                                     range: [0, 320],
                                                     tickmode: 'array',
                                                     tickvals: [20,40,60,80,100,120,140,160,180,200,220,240,260, 280, 300, 320],
                                                     ticktext: [20,40,60,80,100,120,140,160,180,200,220,240,260, 280, 300, '...'],
                                                   },

                                                   yaxis: {
                                                     title: {
                                                       text: i18n.t("result.number_people"),
                                                       font: {
                                                         family: 'sans-serif',
                                                         size: 18,
                                                         color: 'black'
                                                       }
                                                     },
                                                     ////////////////////////////////////////////////////// FORMULA
                                                         // distribution to 5 rows
                                                         dtick: Math.round(Math.round(maxres/5)/10)*10,
                                                         gridwidth: 1
                                                   }
                                           }}
                                           config={{
                                             responsive: true,
                                             displayModeBar: false,
                                             staticPlot: true,
                                           }}
                                         />
                                       </Row>
                                     </div>
               </div>
            <div className="card reverse">
                <div className="card-body reverse" style={{minHeight: "500px"}}>

                    <h5 style={{marginTop: '20px', textAlign: "center", fontFamily: 'sans-serif', fontWeight: "bold"}}>
                        <Trans i18nKey="result.land_calc.header" />
                    </h5>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p >
                        <Trans i18nKey="result.land_calc.intro" />
                    </p>
                    </div>
                    <Row>
                        <LandCalculator userResult={calculationResult.result}/>
                    </Row>
                </div>
            </div>
            <div  id = "header"></div>
           <div className="card-body plot-print reverse"  style={{ margin: '0px', padding: "0px",display:"none"}} >
                <p style={{ textAlign: "center",fontFamily: 'sans-serif',padding:"30px"}}>
        This PDF has been automatically generated by our platform to provide a visual representation of your performance metrics.
        For easy access and sharing, you can scan the QR code included.                <img src={qrcode}  style={{marginLeft:"50px",width:"100px"}}/>
                    </p>
           </div>
</div>
                <div className="card no-print reverse" >
                      <div className="card-body reverse" style={{ marginTop:"30px",minHeight: "70px"}}>

                        {this.state.show && <div>
                                            { this.state.submitted && this.props.contactReducer.sendFulfilled &&
                                            <Alert variant="success">
                                                <Trans i18nKey="contact.send_success"/>
                                            </Alert>}
                                            { this.state.submitted && this.props.contactReducer.error &&
                                            <Alert variant="danger">
                                                <Trans i18nKey="contact.send_fail"/> <br/> {this.props.contactReducer.error.message}
                                            </Alert>}

                                                    {!this.state.sent && <Form noValidate validated={this.state.formValidated} onSubmit={this.handleSend}>
                                                        <Form.Row>
                                                            <Form.Group as={Col}>
                                                                <Form.Label><Trans i18nKey="contact.first_name"/> *</Form.Label>
                                                                <Form.Control required type="text" value={this.state.first_name}
                                                                              name={"first_name"} onChange={this.handleInputChange} placeholder="Name" />
                                                            </Form.Group>

                                                            <Form.Group as={Col}>
                                                                <Form.Label><Trans i18nKey="contact.last_name"/> *</Form.Label>
                                                                <Form.Control required type="text" value={this.state.last_name}
                                                                              name={"last_name"} onChange={this.handleInputChange}placeholder="Last name" />
                                                            </Form.Group>
                                                        </Form.Row>

                                                        <Form.Group>
                                                            <Form.Label><Trans i18nKey="contact.email"/> *</Form.Label>
                                                        { this.props.userReducer.user == null &&
                                                            <Form.Control required type="email" value={this.state.email}
                                                                          name={"email"} onChange={this.handleInputChange} placeholder="example@uni.lu" />
                                                        }
                                                        { this.props.userReducer.user != null &&
                                                            <Form.Control disabled type="email" value={this.props.userReducer.user.email}
                                                                          name={"email"} onChange={this.handleInputChange} placeholder="example@uni.lu" />
                                                        }
                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Form.Check type="checkbox"
                                                                        required
                                                                        label={<span><Trans i18nKey="contact.consensus"/><Link to="/privacyNotice"><Trans i18nKey="contact.privacy_policy"/></Link> *</span>}
                                                                        name={"consensus"} value={this.state.consensus}
                                                                        onChange={this.handleConsensusChange}/>
                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Trans i18nKey="contact.mandatory_field"/>
                                                        </Form.Group>

                                                        <Button type="submit" className="reverse"variant="primary" size="lg" block
                                                                disabled={this.props.contactReducer.sending}>
                                                            {this.props.contactReducer.sending ? <Trans i18nKey="contact.sending"/> : <Trans i18nKey="contact.send"/>}
                                                        </Button>
                                                    </Form>}
                                            </div>}
                      { !this.state.show && <div className="card-body text-center reverse" style={{ minHeight: "70px"}}>
                             <button variant="primary" onClick={this.handleShow} className="btn btn-primary reverse"><Trans i18nKey="result.getpdf" /></button>
                        </div>}
                        </div>
                      </div>


        </div>
        <VerticalSpace vheight={2} />
      </React.Fragment>
    );
  }
}
//                  <Button variant="primary" onClick={this.handleShow} style={{float: "right", margin:"10px"}}>
//                                  Info
//                  </Button>

//              <Col md={1} xs={2}
//                    className="noMargin padding"
//                    style={{ textAlign: "right" }}
//                 >
//              <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={this.state.show} onHide={this.handleClose} animation={false}>
//                      <Modal.Header closeButton>
//                        <Modal.Title>Information</Modal.Title>
//                      </Modal.Header>
//                      <Modal.Body><iframe src={detailsFile} style={{width: '100%', height:'700px'}}/></Modal.Body>
//                      <Modal.Footer>
//                        <Button variant="secondary" onClick={this.handleClose}>
//                          Close
//                        </Button>
//                      </Modal.Footer>
//                    </Modal>
//                    </Col>
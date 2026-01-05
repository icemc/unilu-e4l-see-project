//import React from "react";
//import Container from "react-bootstrap/Container";
//import Row from "react-bootstrap/Row";
//import Button from "react-bootstrap/Button";
//import Col from "react-bootstrap/Col";
//import phillip_dale from "../../public/img/team/phillip_dale.png";
//import robert_a_p_reuter from "../../public/img/team/robert_a.p_reuter.png";
//import michele_melchiorre from "../../public/img/team/michele_melchiorre.png";
//import max_h_wolter from "../../public/img/team/max_h_wolter.png";
//import alice_debot from "../../public/img/team/alice_debot.png";
//import alfredo_capozucca from "../../public/img/team/alfredo_capozucca.png";
//import conrad_spindler from "../../public/img/team/Conrad_Spindler.png";
//import david_kieffer from "../../public/img/team/David_Kieffer.jpg";
//import jonathan_rommelfangen from "../../public/img/team/Jonathan_Rommelfangen.png";
//import vanitha_varadharajan from "../../public/img/team/Vanitha_Varadharajan.png"
//import biewesch_kevin from "../../public/img/team/biewesch_kevin.jpg"
//import BLAZQUEZ_alfredo from "../../public/img/team/BLAZQUEZ_Alfredo.jpeg"
//import thibault_simonetto from "../../public/img/team/Thibault_Simonetto.png"
//import venkat from "../../public/img/team/venkat.png"
//import anon_m from "../../public/img/team/anon_m.png"
//import joana from "../../public/img/team/joana.jpeg"
//import ricardo_poeira from "../../public/img/team/Ricardo_Poeira.png"
//import boris from "../../public/img/team/boris.jpg"
//import romain from "../../public/img/team/romain.png"
//import una_k from "../../public/img/team/Una_Karahasanovic.jpg"
//import unknown from "../../public/img/team/unknown.png"
//import louisk from "../../public/img/team/louisk.jpg"
//import mykytay from "../../public/img/team/mykytay.jpeg"
//import fedorch from "../../public/img/team/fedorch.jpg"
//import {Trans} from "react-i18next";
//import {Card, Image} from "react-bootstrap";
//import { hideNavButton, showNavButton } from "../action/navAction";
//import { connect } from "react-redux";
//
//@connect((store) => {
//    return {
//    };
//})
//export class Team extends React.Component {
//    constructor(props) {
//        super(props);
//        this.state = {
//            selectedMember: -1,
//            group: this.team
//        }
//    }
//    componentDidMount() {
//      this.props.dispatch(showNavButton());
//      document.documentElement.setAttribute("data-theme", localStorage.getItem("kid")=="false" ? "adult-invert": "kid" );
//    }
//
//    selectMember = (i,g) => {
//        this.setState({
//            selectedMember: i,
//            group: g
//        })
//    }
//
//    renderTeamSection = (teamGroup, title) => {
//        return (
//        <div>
//                <Row className="justify-content-center" style={{ textAlign: "center" }}>
//                    <Col xs={12}>
//                        <h4>{title}</h4>
//                    </Col>
//                </Row>
//         <div>
//                <Row className="justify-content-center" style={{ textAlign: "center" }}>
//                    {teamGroup.map((m, i) => (
//                        <Col xs={6} md={3} style={{ marginBottom: "35px" }} key={i}>
//                            <span style={{ cursor: "pointer" }} onClick={() => this.selectMember(i, teamGroup)}>
//                                <div className="img-container">
//                                    <Image src={m.img} fluid />
//                                </div>
//                                <h5>{m.name}</h5>
//                            </span>
//                        </Col>
//                    ))}
//                </Row>
//           </div>
//          </div>
//        );
//    }
//
//    render() {
//        let selected = this.state.selectedMember < 0 ? null : this.state.group[this.state.selectedMember];
//        return (
//            <React.Fragment>
//                <Container>
//                    <Card>
//                        <Card.Header>
//                            <h4 style={{width: "100%", textAlign: "center"}}>
//                                <Trans i18nKey="team.who_are_we"/>
//                            </h4>
//                        </Card.Header>
//                        <Card.Body>
//                            {!selected &&
//                            <div>
//                                {this.renderTeamSection(this.project_coordinator, <Trans i18nKey="team.blocks.PrCoor"></Trans> )}
//                                {this.renderTeamSection(this.core_team, <Trans i18nKey="team.blocks.CoreTeam"></Trans>)}
//                                {this.renderTeamSection(this.maintainers, <Trans i18nKey="team.blocks.MainTain"></Trans>)}
//                                {this.renderTeamSection(this.team, <Trans i18nKey="team.blocks.PastMem"></Trans>)}
//                           </div>
//                            }
//                            {selected && <span>
//                                <Button variant="link" onClick={(e) => this.selectMember(-1)}>
//                                    <i className="fa fa-angle-left" /> <Trans i18nKey="team.back"></Trans>
//                                </Button>
//                                <Row>
//                                    <Col md={4}>
//                                        <div className="img-container" style={{height: "300px"}}>
//                                            <Image src={`${selected.img}`} fluid/>
//                                        </div>
//                                    </Col>
//                                    <Col style={{paddingTop: "10px"}}>
//                                        <h5>{selected.name}</h5>
//                                        <span>
//                                            {selected.info()}
//                                        </span>
//                                    </Col>
//                                </Row>
//                            </span>}
//                        </Card.Body>
//                    </Card>
//                </Container>
//            </React.Fragment>
//        );
//    }
//
//    project_coordinator= [
//            {
//                name: "Dr. Phillip Dale",
//                img: phillip_dale,
//                info: () => <Trans i18nKey="team.members.phillipd"><a href="https://www.uni.lu/fstm-en/research-groups/laboratory-for-energy-materials" /></Trans>
//            }
//            ].sort((a, b) => a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1)
//    core_team = [
//            {
//                name: "Dr. Alfredo Capozucca",
//                img: alfredo_capozucca,
//                info: () => <Trans i18nKey="team.members.alfredoc"><a href='https://acapozucca.github.io/'/></Trans>
//            },
//            {
//                name: "Dr. Michele Melchiorre",
//                img: michele_melchiorre,
//                info: () => <Trans i18nKey="team.members.michelem"><a href='https://wwwfr.uni.lu/recherche/fstm/dphyms/research/photovoltaics'/></Trans>
//            },
//            {
//                name: "Dr. Louis Krieger",
//                img: louisk,
//                info: () => <Trans i18nKey="team.members.louisk"><a href='https://www.list.lu/en/environment/'/></Trans>
//            }
//
//    ].sort((a, b) => a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1)
//    maintainers = [
//            {
//                name: "Joana Ferreira",
//                img: joana,
//                info: () => <Trans i18nKey="team.members.joanaf" />
//            },
//            {
//                name: "Ricardo Poeira",
//                img: ricardo_poeira,
//                info: () => <Trans i18nKey="team.members.ricardop"><a href="https://pace.uni.lu/the-team/" /></Trans>
//            },
//            {
//                name: "Mykyta Yampolskyi",
//                img: mykytay,
//                info: () => <Trans i18nKey="team.members.mykytay"></Trans>
//            },
//            {
//            name: "Dr. Robert A.P. Reuter",
//            img: robert_a_p_reuter,
//            info: () => <Trans i18nKey="team.members.robertr"><a href="https://wwwen.uni.lu/research/fhse/desw/people/robert_reuter" /></Trans>
//            },
//
//    ].sort((a, b) => a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1)
//
//    team = [
//        {
//            name: "Fedor Chikhachev",
//            img: fedorch,
//            info: () => <Trans i18nKey="team.members.fedorch"/>
//        },
//        {
//            name: "Alfredo Blazquez",
//            img: BLAZQUEZ_alfredo,
//            info: () => <Trans i18nKey="team.members.alfredob"><a href="https://pace.uni.lu/the-team/" /></Trans>
//        },
//        {
//            name: "Alice Debot",
//            img: alice_debot,
//            info: () => <Trans i18nKey="team.members.aliced"><a href="https://wwwen.uni.lu/research/fstm/dphyms/research/photovoltaics" /></Trans>
//        },
//        {
//            name: "Jonathan Rommelfangen",
//            img: jonathan_rommelfangen,
//            info: () => <Trans i18nKey="team.members.jonathanr" />
//        },
//        {
//            name: "Dr. Conrad Spindler",
//            img: conrad_spindler,
//            info: () => <Trans i18nKey="team.members.conrads" />
//        },
//        {
//            name: "Vanitha Varadharajan",
//            img: vanitha_varadharajan,
//            info: () => <Trans i18nKey="team.members.vanithav"><a href='https://www.linkedin.com/in/vanitha-varadharajan-663942a0/'/></Trans>
//        },
//        {
//            name: "Dr. Max H. Wolter",
//            img: max_h_wolter,
//            info: () => <Trans i18nKey="team.members.maxw"><a href='https://wwwfr.uni.lu/recherche/fstm/dphyms/research/photovoltaics'/></Trans>
//        },
//        {
//            name: "David Kieffer",
//            img: david_kieffer,
//            info: () => <Trans i18nKey="team.members.davidk" />
//        },
//        {
//            name: "Thibault Simonetto",
//            img: thibault_simonetto,
//            info: () => <Trans i18nKey="team.members.thibaults" />
//        },
//        {
//            name: "Kevin Biewesch",
//            img: biewesch_kevin,
//            info: () => <Trans i18nKey="team.members.kevinb" />
//        },
//        {
//            name: "Boris Floka",
//            img: boris,
//            info: () => <Trans i18nKey="team.members.borisf" />
//        },
//        {
//            name: "Romain Roland",
//            img: romain,
//            info: () => <Trans i18nKey="team.members.romainr"><a href="https://www.linkedin.com/in/romain-roland-5783511b9/" /></Trans>
//        },
//        {
//            name: "Venkateshwaran Thamilselvan",
//            img: venkat,
//            info: () => <Trans i18nKey="team.members.venkateshwarant"><a href="https://www.linkedin.com/in/venkateshwaran-thamilselvan" /></Trans>
//        },
//        {
//            name: "Dr. Una Karahasanovic",
//            img: una_k,
//            info: () => <Trans i18nKey="team.members.unak"><a href="https://pace.uni.lu/the-team/" /></Trans>
//        }
//    ].sort((a, b) => a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1)
//}
import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Card, Image } from "react-bootstrap";
import { Trans } from "react-i18next";
import { connect } from "react-redux";
import { showNavButton } from "../action/navAction";

import "../../css/Team.css";

// images
import phillip_dale from "../../public/img/team/phillip_dale.png";
import robert_a_p_reuter from "../../public/img/team/robert_a.p_reuter.png";
import michele_melchiorre from "../../public/img/team/michele_melchiorre.png";
import max_h_wolter from "../../public/img/team/max_h_wolter.png";
import alice_debot from "../../public/img/team/alice_debot.png";
import alfredo_capozucca from "../../public/img/team/alfredo_capozucca.png";
import conrad_spindler from "../../public/img/team/Conrad_Spindler.png";
import david_kieffer from "../../public/img/team/David_Kieffer.jpg";
import jonathan_rommelfangen from "../../public/img/team/Jonathan_Rommelfangen.png";
import vanitha_varadharajan from "../../public/img/team/Vanitha_Varadharajan.png";
import biewesch_kevin from "../../public/img/team/biewesch_kevin.jpg";
import BLAZQUEZ_alfredo from "../../public/img/team/BLAZQUEZ_Alfredo.jpeg";
import thibault_simonetto from "../../public/img/team/Thibault_Simonetto.png";
import venkat from "../../public/img/team/venkat.png";
import joana from "../../public/img/team/joana.jpeg";
import ricardo_poeira from "../../public/img/team/Ricardo_Poeira.png";
import boris from "../../public/img/team/boris.jpg";
import romain from "../../public/img/team/romain.png";
import una_k from "../../public/img/team/Una_Karahasanovic.jpg";
import louisk from "../../public/img/team/louisk.jpg";
import mykytay from "../../public/img/team/mykytay.jpeg";
import fedorch from "../../public/img/team/fedorch.jpg";

@connect((store) => {
  return {};
})
export class Team extends React.Component {
  CFG = {
    orbitSpeed: 0.00035,

    // sizing used for layout math (match your CSS sizes)
    centerCardWidth: 320,
    centerCardHeight: 96,
    electronSize: 60,
    electronGap: 10,

    // counts
    currentPreviewCount: 10,
    pastPreviewCount: 12,
    pastVisibleExpanded: 44, // higher ok because we use rings now
    groupVisibleExpanded: 18,

    // ring spacing
    ringGapFactor: 0.95, // ring radius step ~ electronDiameter * factor

    // how much margin to keep from edges
    edgeMargin: 18,
  };

  constructor(props) {
    super(props);
    this.state = {

      layer: 0, // 0 => two centers, 1 => inside current/past
      focus: null, // "current" | "past" | null
      expandedKey: null, // current group expanded
      selected: null,
      pastBatch: 0,

      now: 0,
      w: 0,
      h: 0,
      themeMode: "adult",
      animPhase: "idle", // "idle" | "out" | "in"
      isMobile: false,

    };

    this.stageRef = React.createRef();
    this.raf = null;
    this.lastT = null;
  }
  _animTimers = [];

  componentDidMount() {
    this.props.dispatch(showNavButton());
    var kidFlag = localStorage.getItem("kid");
    var theme = kidFlag == "false" ? "adult-invert" : "kid";
    document.documentElement.setAttribute("data-theme", theme);
    this.setState({ themeMode: theme === "kid" ? "kid" : "adult" });

    this.measure();
    this.updateIsMobile();
    window.addEventListener("resize", this.measure);
    this.startRAF();

    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.measure);
    if (this.raf) cancelAnimationFrame(this.raf);
    document.removeEventListener("keydown", this.onKeyDown);

    for (var i = 0; i < this._animTimers.length; i++) clearTimeout(this._animTimers[i]);
    this._animTimers = [];
  }

  onKeyDown = (e) => {
    if (e && e.key === "Escape") this.closeMember();
  };

  measure = () => {
    var el = this.stageRef.current;
    if (!el) return;
    var r = el.getBoundingClientRect();
    this.setState({ w: r.width, h: r.height }, this.updateIsMobile);
  };

    updateIsMobile = () => {
      var w = this.state.w || 0;
      this.setState({ isMobile: w > 0 && w < 768 });
    };


startTransition = (applyNext) => {
  var self = this;

  // clear previous timers
  for (var i = 0; i < this._animTimers.length; i++) clearTimeout(this._animTimers[i]);
  this._animTimers = [];

  this.setState({ animPhase: "out" });
  this.setState({ animPhase: "out" });

  this._animTimers.push(setTimeout(function () {
    applyNext();
    self.setState({ animPhase: "in" });
  }, 160));

  this._animTimers.push(setTimeout(function () {
    self.setState({ animPhase: "idle" });
  }, 360));
};



  startRAF = () => {
    this.lastT = performance.now();
    var tick = (t) => {
      var dt = t - this.lastT;
      this.lastT = t;
      this.setState(function (s) {
        return { now: s.now + dt };
      });
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  };

  // ===== helpers =====
  hash01(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  // ring layout with automatic multi-rings (no overlaps)
  // returns [{member, x, y, ringIndex}]
  layoutRings(cx, cy, members, count, baseR, maxR, t, seedKey) {
    var out = [];
    var n = Math.min(members.length, count);

    var d = this.CFG.electronSize + this.CFG.electronGap; // effective diameter
    var ringStep = d * this.CFG.ringGapFactor;

    var idx = 0;
    var ring = 0;
    var r = baseR;

    while (idx < n && r <= maxR) {
      var cap = Math.max(1, Math.floor((2 * Math.PI * r) / d));
      var take = Math.min(cap, n - idx);

      // gentle rotation per ring (keeps spacing constant)
      var phase = (t * (0.55 + ring * 0.10)) + this.hash01(seedKey + ":ring:" + ring) * Math.PI * 2;

      for (var i = 0; i < take; i++) {
        var m = members[idx];
        var a = phase + (i * (Math.PI * 2)) / take;

        var x = cx + r * Math.cos(a);
        var y = cy + r * Math.sin(a);

        out.push({ member: m, x: x, y: y, ringIndex: ring });
        idx++;
      }

      ring++;
      r += ringStep;
    }

    return out;
  }

  clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // ===== navigation =====
goRoot = () => {
  var self = this;
  this.startTransition(function () {
    self.setState({
      layer: 0,
      focus: null,
      expandedKey: null,
      selected: null,
      pastBatch: 0,
    });
  });
};

enterFocus = (key) => {
  var self = this;
  var ALL = "__ALL__";

  this.startTransition(function () {
    self.setState({
      layer: 1,
      focus: key, // "current" | "past"
     expandedKey: key === "current" ? ALL : null,
      selected: null,
      pastBatch: 0,
    });
  });
};

expandCurrentGroup = (key) => {
  var ALL = "__ALL__";
  this.setState(function (s) {
    // якщо зараз ALL -> фокус на один
    if (s.expandedKey === ALL) return { expandedKey: key, selected: null };
    // якщо натиснули той самий -> повернути ALL
    if (s.expandedKey === key) return { expandedKey: ALL, selected: null };
    // інакше перемкнути на інший
    return { expandedKey: key, selected: null };
  });
};


  showMorePast = () => {
    this.setState(function (s) {
      return { pastBatch: s.pastBatch + 1 };
    });
  };

  openMember = (member, groupKey) => {
    this.setState({ selected: { member: member, groupKey: groupKey } });
  };

  closeMember = () => {
    this.setState({ selected: null });
  };

  getCurrentGroups() {
    return [
      { key: "coordinator", title: <Trans i18nKey="team.blocks.PrCoor" />, members: this.project_coordinator },
      { key: "core", title: <Trans i18nKey="team.blocks.CoreTeam" />, members: this.core_team },
      { key: "maintainers", title: <Trans i18nKey="team.blocks.MainTain" />, members: this.maintainers },
    ];
  }

  getAllCurrentMembers() {
    return this.project_coordinator.concat(this.core_team).concat(this.maintainers);
  }

  render() {
    var layer = this.state.layer;
    var focus = this.state.focus;
    var expandedKey = this.state.expandedKey;
    var selected = this.state.selected;
    var pastBatch = this.state.pastBatch;

    var stageW = this.state.w || 1100;
    var stageH = this.state.h || 620;

    var cx = stageW / 2;
    var cy = stageH / 2;

    var t = this.state.now * this.CFG.orbitSpeed;

    var margin = this.CFG.edgeMargin;
    var centerHalfW = this.CFG.centerCardWidth / 2;
    var centerHalfH = this.CFG.centerCardHeight / 2;

    // keep centers inside bounds
    var safeLeft = margin + centerHalfW;
    var safeRight = stageW - margin - centerHalfW;
    var safeTop = margin + centerHalfH;
    var safeBottom = stageH - margin - centerHalfH;

    // ===== LAYER 0: use all space, two centers far apart =====

    var isMobile = this.state.isMobile;


    // anchor them at 25% and 75% width
// anchors
var leftX = isMobile ? cx : this.clamp(stageW * 0.24, safeLeft, safeRight);
var rightX = isMobile ? cx : this.clamp(stageW * 0.76, safeLeft, safeRight);

var y0 = this.clamp(stageH * 0.52, safeTop, safeBottom);
var topY = this.clamp(stageH * 0.32, safeTop, safeBottom);
var botY = this.clamp(stageH * 0.72, safeTop, safeBottom);


var leftY = isMobile ? topY : y0;
var rightY = isMobile ? botY : y0;

var floatY = 10 * Math.sin(t * 2.0);
    var floatX = 8 * Math.cos(t * 1.6);


    var leftCenter = {
      x: leftX + floatX,
      y: y0 + floatY,
      img: this.project_coordinator[0] ? this.project_coordinator[0].img : null,
      count: this.getAllCurrentMembers().length,
    };

    var rightCenter = {
      x: rightX - floatX,
      y: y0 - floatY,
      img: this.team[0] ? this.team[0].img : null,
      count: this.team.length,
    };

    // ===== LAYER 1 CURRENT: place 3 centers as big triangle using full space (NO OVERLAP) =====
    var centersL1 = [];

    if (layer === 1 && focus === "current") {
      var groups = this.getCurrentGroups();

      // triangle points (spread)
      var top = { x: cx, y: stageH * 0.22 };
      var bl = { x: stageW * 0.26, y: stageH * 0.72 };
      var br = { x: stageW * 0.74, y: stageH * 0.72 };

      // clamp to safe area
      top.x = this.clamp(top.x, safeLeft, safeRight);
      top.y = this.clamp(top.y, safeTop, safeBottom);
      bl.x = this.clamp(bl.x, safeLeft, safeRight);
      bl.y = this.clamp(bl.y, safeTop, safeBottom);
      br.x = this.clamp(br.x, safeLeft, safeRight);
      br.y = this.clamp(br.y, safeTop, safeBottom);

      var pts;
        if (isMobile) {
          pts = [
            { x: cx, y: stageH * 0.24 },
            { x: cx, y: stageH * 0.50 },
            { x: cx, y: stageH * 0.76 },
          ];
        } else {
          pts = [
            { x: cx, y: stageH * 0.22 },
            { x: stageW * 0.26, y: stageH * 0.72 },
            { x: stageW * 0.74, y: stageH * 0.72 },
          ];
        }

      centersL1 = groups.map((g, idx) => {
        var p = pts[idx];
        // tiny float only (won't cause overlaps)
        var fx = 6 * Math.cos(t * (1.1 + idx * 0.2));
        var fy = 6 * Math.sin(t * (1.0 + idx * 0.2));
        return {
          key: g.key,
          title: g.title,
          count: g.members.length,
          x: p.x + fx,
          y: p.y + fy,
          members: g.members,
          img: g.members && g.members[0] ? g.members[0].img : null,
        };
      });
    }

    // ===== LAYER 1 PAST: single center in middle =====
    var pastCenterL1 = null;
    if (layer === 1 && focus === "past") {
      pastCenterL1 = {
        x: cx,
        y: cy,
        img: this.team[0] ? this.team[0].img : null,
      };
    }

    // ===== ELECTRONS: PREVIEWS (layer 0) with rings (no overlap) =====
    var currentPreview = [];
    var pastPreview = [];

    var maxR0 = Math.min(stageW, stageH) * 0.24; // allow bigger ring
    var baseR0 = Math.min(stageW, stageH) * 0.14;

    if (layer === 0) {
      currentPreview = this.layoutRings(
        leftCenter.x,
        leftCenter.y,
        this.getAllCurrentMembers(),
        this.CFG.currentPreviewCount,
        baseR0,
        maxR0,
        t,
        "curPreview"
      );

      pastPreview = this.layoutRings(
        rightCenter.x,
        rightCenter.y,
        this.team,
        this.CFG.pastPreviewCount,
        baseR0,
        maxR0,
        t,
        "pastPreview"
      );
    }

    // ===== ELECTRONS: CURRENT group expansion (layer1 current) =====
    var ALL = "__ALL__";
    var groupElectrons = [];

    if (layer === 1 && focus === "current") {
      var maxR = Math.min(stageW, stageH) * (isMobile ? 0.18 : 0.22);
      var baseR = Math.min(stageW, stageH) * (isMobile ? 0.11 : 0.14);

      if (expandedKey === ALL) {
        // ✅ показати трохи електронів навколо кожного з 3 центрів
        var perGroup = isMobile ? 6 : 8;

        for (var ci = 0; ci < centersL1.length; ci++) {
          var c = centersL1[ci];
          var laid = this.layoutRings(
            c.x, c.y,
            c.members,
            perGroup,
            baseR,
            maxR,
            t,
            "groupAll:" + c.key
          );

          for (var li = 0; li < laid.length; li++) {
            groupElectrons.push({ groupKey: c.key, member: laid[li].member, x: laid[li].x, y: laid[li].y });
          }
        }
      } else if (expandedKey) {
        // ✅ як раніше: показати більше для одного центру
        var expanded = null;
        for (var i = 0; i < centersL1.length; i++) if (centersL1[i].key === expandedKey) expanded = centersL1[i];

        if (expanded) {
          var laid2 = this.layoutRings(
            expanded.x, expanded.y,
            expanded.members,
            groupExpandedCount,
            baseR,
            Math.min(stageW, stageH) * (isMobile ? 0.22 : 0.26),
            t,
            "groupOne:" + expandedKey
          );

          for (var k = 0; k < laid2.length; k++) {
            groupElectrons.push({ groupKey: expandedKey, member: laid2[k].member, x: laid2[k].x, y: laid2[k].y });
          }
        }
      }
    }

    // ===== ELECTRONS: PAST focus ring (layer1 past) =====
    var pastVisibleCount = Math.min(this.team.length, this.CFG.pastVisibleExpanded + pastBatch * 10);
    var pastFocusElectrons = [];

    if (layer === 1 && focus === "past" && pastCenterL1) {
      var maxRPast = Math.min(stageW, stageH) * 0.42;
      var baseRPast = Math.min(stageW, stageH) * 0.18;

      pastFocusElectrons = this.layoutRings(
        pastCenterL1.x,
        pastCenterL1.y,
        this.team,
        pastVisibleCount,
        baseRPast,
        maxRPast,
        t,
        "pastFocus"
      );
    }

    // +N button near outer ring (no overlap; put it at fixed angle on outermost allowed radius)
    var remainingPast = Math.max(0, this.team.length - pastVisibleCount);
    var moreElectron = null;
    if (layer === 1 && focus === "past" && remainingPast > 0 && pastCenterL1) {
      var rMore = Math.min(stageW, stageH) * 0.42;
      var aMore = t * 0.35 + Math.PI / 5;
      moreElectron = { x: pastCenterL1.x + rMore * Math.cos(aMore), y: pastCenterL1.y + rMore * Math.sin(aMore), remaining: remainingPast };
    }

    var modalMember = selected ? selected.member : null;
    var showBack = layer === 1;
              var animCls = this.state.animPhase === "out" ? "phaseOut" : (this.state.animPhase === "in" ? "phaseIn" : "");
              var mobileCls = this.state.isMobile ? "isMobile" : "";

    return (

      <React.Fragment>
        <Container>
          <Card className="teamCard">
            <Card.Header className="teamHeader">
              <div className="teamHeaderRow">
                <h4 className="teamTitle">
                  <Trans i18nKey="team.who_are_we" />
                </h4>
                <div className="teamHeaderActions">
                  {showBack ? (
                    <Button className="teamBtnGhost" onClick={this.goRoot}>
                      <i className="fa fa-angle-left" /> <Trans i18nKey="team.back" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div className={"electronStageWrap " + (layer === 1 ? "isExpanded " : "") + animCls + " " + mobileCls}>
                <div className="electronStage" ref={this.stageRef}>
                  {/* ===== layer 0 ===== */}
                  {layer === 0 ? (
                    <React.Fragment>
                      <div
                        className="coreNode bigCenter rootCenter electronFx coreFx"
                        style={{ left: leftCenter.x, top: (isMobile ? leftCenter.y  -200 :  leftCenter.y) }}
                        onClick={() => this.enterFocus("current")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="coreAvatar coreAvatarLg">
                          {leftCenter.img ? <img src={leftCenter.img} alt="Current" /> : null}
                        </div>
                        <div className="coreMeta">
                          <div className="coreTitle">Current</div>
                          <div className="coreCount">{leftCenter.count}</div>
                        </div>
                      </div>

                      <div
                        className="coreNode bigCenter rootCenter electronFx coreFx"
                        style={{ left: rightCenter.x, top: rightCenter.y }}
                        onClick={() => this.enterFocus("past")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="coreAvatar coreAvatarLg">
                          {rightCenter.img ? <img src={rightCenter.img} alt="Past" /> : null}
                        </div>
                        <div className="coreMeta">
                          <div className="coreTitle">Past</div>
                          <div className="coreCount">{rightCenter.count}</div>
                        </div>
                      </div>

                      {currentPreview.map((p) => (
                        <div
                          key={"curPrev:" + p.member.name}
                          className="electron memberElectron electronBig electronFx"
                          style={{ left: p.x, top:   (isMobile ? p.y  -200 :  p.y)  }}
                          onClick={() => this.openMember(p.member, "current")}
                          role="button"
                          tabIndex={0}
                          title={p.member.name}
                        >
                          <span className="trail t1" />
                          <span className="trail t2" />
                          <span className="trail t3" />
                          <img src={p.member.img} alt={p.member.name} />
                        </div>
                      ))}

                      {pastPreview.map((p) => (
                        <div
                          key={"pastPrev:" + p.member.name}
                          className="electron pastElectron electronBig electronFx"
                          style={{ left: p.x, top: p.y }}
                          onClick={() => this.openMember(p.member, "past")}
                          role="button"
                          tabIndex={0}
                          title={p.member.name}
                        >
                          <span className="trail t1" />
                          <span className="trail t2" />
                          <span className="trail t3" />
                          <img src={p.member.img} alt={p.member.name} />
                        </div>
                      ))}
                    </React.Fragment>
                  ) : null}

                  {/* ===== layer 1 current ===== */}
                  {layer === 1 && focus === "current" ? (
                    <React.Fragment>
                      {centersL1.map((c) => {
                        var active = expandedKey && c.key === expandedKey;
                        return (
                          <div
                            key={c.key}
                            className={"coreNode bigCenter electronFx coreFx" + (active ? "active" : "")}
                            style={{ left: c.x, top: c.y }}
                            role="button"
                          >
                            <div className="coreAvatar coreAvatarLg">
                              {c.img ? <img src={c.img} alt={c.key} /> : null}
                            </div>
                            <div className="coreMeta">
                              <div className="coreTitle">{c.title}</div>
                              <div className="coreCount">{c.count}</div>
                            </div>
                          </div>
                        );
                      })}

                      {groupElectrons.map((e) => (
                        <div
                          key={e.groupKey + ":" + e.member.name}
                          className="electron memberElectron electronBig electronFx"
                          style={{ left: e.x, top: e.y }}
                          onClick={() => this.openMember(e.member, e.groupKey)}
                          role="button"
                          tabIndex={0}
                          title={e.member.name}
                        >
                          <span className="trail t1" />
                          <span className="trail t2" />
                          <span className="trail t3" />
                          <img src={e.member.img} alt={e.member.name} />
                        </div>
                      ))}
                    </React.Fragment>
                  ) : null}

                  {/* ===== layer 1 past ===== */}
                  {layer === 1 && focus === "past" ? (
                    <React.Fragment>
                      <div
                        className="coreNode bigCenter rootCenter electronFx coreFx"
                        style={{ left: pastCenterL1.x, top: pastCenterL1.y }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="coreAvatar coreAvatarLg">
                          {pastCenterL1.img ? <img src={pastCenterL1.img} alt="Past members" /> : null}
                        </div>
                        <div className="coreMeta">
                          <div className="coreTitle">Past Members</div>
                          <div className="coreCount">{this.team.length}</div>
                        </div>
                      </div>

                      {pastFocusElectrons.map((p) => (
                        <div
                          key={"past:" + p.member.name}
                          className="electron pastElectron electronBig pastStrong electronFx"
                          style={{ left: p.x, top: p.y }}
                          onClick={() => this.openMember(p.member, "past")}
                          role="button"
                          tabIndex={0}
                          title={p.member.name}
                        >
                          <span className="trail t1" />
                          <span className="trail t2" />
                          <span className="trail t3" />
                          <img src={p.member.img} alt={p.member.name} />
                        </div>
                      ))}

                      {moreElectron ? (
                        <div
                          className="electron moreElectron electronBig"
                          style={{ left: moreElectron.x, top: moreElectron.y }}
                          onClick={this.showMorePast}
                          role="button"
                          tabIndex={0}
                          title="Show more past members"
                        >
                          <div className="moreText">+{moreElectron.remaining}</div>
                        </div>
                      ) : null}
                    </React.Fragment>
                  ) : null}
                </div>

                <div className="teamHint">
                  {layer === 0 ? (
                    <span>
                      <span className="dot" /> Two centers. No overlaps: electrons are placed in rings automatically.
                    </span>
                  ) : focus === "current" ? (
                    <span>
                      <span className="dot" /> Current groups are spread as a triangle (no overlay). Expand one to see its rings.
                    </span>
                  ) : (
                    <span>
                      <span className="dot" /> Past members are distributed in multiple rings. Use +N to reveal more.
                    </span>
                  )}
                </div>
              </div>

              {/* modal */}
              {selected ? (
                <div className="teamModalOverlay fancyOverlay" onMouseDown={this.closeMember}>
                  <div className="teamModal fancyModal" onMouseDown={(e) => e.stopPropagation()}>
                    <button className="teamModalClose fancyClose" onClick={this.closeMember} aria-label="Close">
                      ×
                    </button>

                    {/* header glass */}
                    <div className="fancyHeader">
                      <div className="fancyGlow" />
                      <div className="fancyAvatarWrap">
                        <div className="fancyAvatarRing" />
                        <img className="fancyAvatar" src={modalMember.img} alt={modalMember.name} />
                      </div>

                      <div className="fancyTitleBlock">
                        <div className="fancyName">{modalMember.name}</div>

                        {/* group badge */}
                        <div className="fancyBadges">
                          <span className={"fancyBadge " + (selected.groupKey === "past" ? "badgePast" : "badgeCurrent")}>
                            {selected.groupKey === "past" ? "Past" : "Current"}
                          </span>
                          {selected.groupKey === "coordinator" ? <span className="fancyBadge badgeRole">Coordinator</span> : null}
                          {selected.groupKey === "core" ? <span className="fancyBadge badgeRole">Core Team</span> : null}
                          {selected.groupKey === "maintainers" ? <span className="fancyBadge badgeRole">Maintainers</span> : null}
                        </div>
                      </div>
                    </div>

                    {/* body */}
                    <div className="fancyBody">
                      {/* info text from i18n */}
                      <div className="fancyInfo">{modalMember.info()}</div>

                      {/* subtle hint */}
                      <div className="fancyHintRow">
                        <span className="fancyHintDot" />
                        <span className="fancyHintText">Click outside or press Esc to close</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

            </Card.Body>
          </Card>
        </Container>
      </React.Fragment>
    );
  }

  // ===== DATA ARRAYS (unchanged) =====
  project_coordinator = [
    {
      name: "Dr. Phillip Dale",
      img: phillip_dale,
      info: () => (
        <Trans i18nKey="team.members.phillipd">
          <a href="https://www.uni.lu/fstm-en/research-groups/laboratory-for-energy-materials" />
        </Trans>
      ),
    },
  ].sort((a, b) => (a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1));

  core_team = [
    {
      name: "Dr. Alfredo Capozucca",
      img: alfredo_capozucca,
      info: () => (
        <Trans i18nKey="team.members.alfredoc">
          <a href="https://acapozucca.github.io/" />
        </Trans>
      ),
    },
    {
      name: "Dr. Michele Melchiorre",
      img: michele_melchiorre,
      info: () => (
        <Trans i18nKey="team.members.michelem">
          <a href="https://wwwfr.uni.lu/recherche/fstm/dphyms/research/photovoltaics" />
        </Trans>
      ),
    },
    {
      name: "Dr. Louis Krieger",
      img: louisk,
      info: () => (
        <Trans i18nKey="team.members.louisk">
          <a href="https://www.list.lu/en/environment/" />
        </Trans>
      ),
    },
  ].sort((a, b) => (a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1));

  maintainers = [
    { name: "Joana Ferreira", img: joana, info: () => <Trans i18nKey="team.members.joanaf" /> },
    {
      name: "Ricardo Poeira",
      img: ricardo_poeira,
      info: () => (
        <Trans i18nKey="team.members.ricardop">
          <a href="https://pace.uni.lu/the-team/" />
        </Trans>
      ),
    },
    { name: "Mykyta Yampolskyi", img: mykytay, info: () => <Trans i18nKey="team.members.mykytay" /> },
    {
      name: "Dr. Robert A.P. Reuter",
      img: robert_a_p_reuter,
      info: () => (
        <Trans i18nKey="team.members.robertr">
          <a href="https://wwwen.uni.lu/research/fhse/desw/people/robert_reuter" />
        </Trans>
      ),
    },
  ].sort((a, b) => (a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1));

  team = [
    { name: "Fedor Chikhachev", img: fedorch, info: () => <Trans i18nKey="team.members.fedorch" /> },
    {
      name: "Alfredo Blazquez",
      img: BLAZQUEZ_alfredo,
      info: () => (
        <Trans i18nKey="team.members.alfredob">
          <a href="https://pace.uni.lu/the-team/" />
        </Trans>
      ),
    },
    {
      name: "Alice Debot",
      img: alice_debot,
      info: () => (
        <Trans i18nKey="team.members.aliced">
          <a href="https://wwwen.uni.lu/research/fstm/dphyms/research/photovoltaics" />
        </Trans>
      ),
    },
    { name: "Jonathan Rommelfangen", img: jonathan_rommelfangen, info: () => <Trans i18nKey="team.members.jonathanr" /> },
    { name: "Dr. Conrad Spindler", img: conrad_spindler, info: () => <Trans i18nKey="team.members.conrads" /> },
    {
      name: "Vanitha Varadharajan",
      img: vanitha_varadharajan,
      info: () => (
        <Trans i18nKey="team.members.vanithav">
          <a href="https://www.linkedin.com/in/vanitha-varadharajan-663942a0/" />
        </Trans>
      ),
    },
    {
      name: "Dr. Max H. Wolter",
      img: max_h_wolter,
      info: () => (
        <Trans i18nKey="team.members.maxw">
          <a href="https://wwwfr.uni.lu/recherche/fstm/dphyms/research/photovoltaics" />
        </Trans>
      ),
    },
    { name: "David Kieffer", img: david_kieffer, info: () => <Trans i18nKey="team.members.davidk" /> },
    { name: "Thibault Simonetto", img: thibault_simonetto, info: () => <Trans i18nKey="team.members.thibaults" /> },
    { name: "Kevin Biewesch", img: biewesch_kevin, info: () => <Trans i18nKey="team.members.kevinb" /> },
    { name: "Boris Floka", img: boris, info: () => <Trans i18nKey="team.members.borisf" /> },
    {
      name: "Romain Roland",
      img: romain,
      info: () => (
        <Trans i18nKey="team.members.romainr">
          <a href="https://www.linkedin.com/in/romain-roland-5783511b9/" />
        </Trans>
      ),
    },
    {
      name: "Venkateshwaran Thamilselvan",
      img: venkat,
      info: () => (
        <Trans i18nKey="team.members.venkateshwarant">
          <a href="https://www.linkedin.com/in/venkateshwaran-thamilselvan" />
        </Trans>
      ),
    },
    {
      name: "Dr. Una Karahasanovic",
      img: una_k,
      info: () => (
        <Trans i18nKey="team.members.unak">
          <a href="https://pace.uni.lu/the-team/" />
        </Trans>
      ),
    },
  ].sort((a, b) => (a.name.split(" ").reverse()[0] > b.name.split(" ").reverse()[0] ? 1 : -1));
}


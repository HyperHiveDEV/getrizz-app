import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
// ── DEV MODE — mettre false pour repasser en mode normal users ──
const DEV_MODE = false;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root { --red:#E8483C; --red-light:#FF7A6E; --bg:#0A0806; --cream:#F2E8E0; --muted:#7A6860; --green:#6DD16D; }
  html,body { background:#0A0806; color:#F2E8E0; font-family:'DM Sans',sans-serif; }
  @keyframes tspin { to{transform:rotate(360deg)} }
  @keyframes tup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes mSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes tdot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.7);opacity:.5} }
  @keyframes cardIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .app { height:100vh; background:#0A0806; display:flex; flex-direction:column; max-width:480px; margin:0 auto; }
  .app-top { padding:14px 20px 12px; background:#0A0806; border-bottom:1px solid rgba(255,255,255,.07); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .app-logo { font-family:'Fraunces',serif; font-size:18px; font-weight:900; color:#FF7A6E; }
  .app-logo span { color:#F2E8E0; }
  .app-pill { font-family:'Space Mono',monospace; font-size:10px; background:rgba(232,72,60,.08); border:1px solid rgba(232,72,60,.25); color:#FF7A6E; padding:4px 10px; border-radius:100px; }
  .app-pill-dev { font-family:'Space Mono',monospace; font-size:10px; background:rgba(109,209,109,.08); border:1px solid rgba(109,209,109,.3); color:#6DD16D; padding:4px 10px; border-radius:100px; }
  .app-ava { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#E8483C,#FF7A6E); display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-size:13px; font-weight:700; color:#fff; }
  .app-top-right { display:flex; align-items:center; gap:10px; }
  .app-content { flex:1; overflow-y:auto; }
  .app-nav { display:flex; background:#0D0A08; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
  .app-nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 4px 12px; cursor:pointer; border:none; background:transparent; color:#4A3830; transition:color .15s; position:relative; }
  .app-nav-btn.active { color:#FF7A6E; }
  .app-nav-btn.active::after { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:24px; height:2px; background:#E8483C; border-radius:0 0 2px 2px; }
  .app-nav-ico { font-size:20px; line-height:1; }
  .app-nav-lbl { font-size:9px; font-weight:600; letter-spacing:.3px; text-transform:uppercase; font-family:'Space Mono',monospace; }
  .app-nav-badge { position:absolute; top:7px; right:calc(50% - 14px); width:7px; height:7px; background:#E8483C; border-radius:50%; border:1px solid #0D0A08; }

  .tab-analyse { padding:20px 18px; display:flex; flex-direction:column; gap:16px; }
  .tab-h1 { font-family:'Fraunces',serif; font-size:22px; font-weight:900; letter-spacing:-.5px; }
  .tab-h1 em { font-style:italic; color:#FF7A6E; font-weight:400; }
  .tab-sub { font-size:13px; color:#7A6860; margin-top:3px; }
  .t-lbl { font-size:10px; font-family:'Space Mono',monospace; color:#7A6860; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; display:block; }
  .t-apps { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
  .t-app { padding:10px 4px; border-radius:11px; cursor:pointer; text-align:center; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:#7A6860; transition:all .15s; font-size:11px; font-weight:600; font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; align-items:center; gap:3px; min-height:60px; justify-content:center; }
  .t-app .e { font-size:20px; }
  .t-app.s { border-color:var(--app-color); background:var(--app-bg); color:var(--app-color); }
  .t-goals { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
  .t-goal { padding:11px 12px; border-radius:11px; cursor:pointer; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:#7A6860; transition:all .15s; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:7px; min-height:48px; }
  .t-goal.s { border-color:#E8483C; background:rgba(232,72,60,.1); color:#FF7A6E; }
  .t-upload { border:2px dashed rgba(232,72,60,.28); border-radius:16px; background:rgba(255,255,255,.02); position:relative; overflow:hidden; min-height:180px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .t-upload.has { border-style:solid; border-color:rgba(232,72,60,.4); min-height:0; }
  .t-upload img { width:100%; display:block; border-radius:14px; max-height:260px; object-fit:cover; }
  .t-upload-inner { display:flex; flex-direction:column; align-items:center; gap:10px; padding:32px 20px; text-align:center; pointer-events:none; }
  .t-upload-ico { font-size:40px; }
  .t-upload-title { font-size:15px; font-weight:600; color:#F2E8E0; }
  .t-upload-sub { font-size:12px; color:#7A6860; line-height:1.6; }
  .t-upload-sub strong { color:#FF7A6E; }
  .t-rm { position:absolute; top:10px; right:10px; background:rgba(0,0,0,.75); border:none; color:#fff; width:30px; height:30px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; z-index:2; }
  .t-btn { width:100%; padding:16px; background:#E8483C; color:#fff; border:none; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 20px rgba(232,72,60,.25); display:flex; align-items:center; justify-content:center; gap:9px; min-height:56px; }
  .t-btn:disabled { opacity:.38; cursor:not-allowed; box-shadow:none; }
  .t-loading { padding:40px 20px; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; }
  .t-spinner { width:48px; height:48px; border:3px solid rgba(232,72,60,.12); border-top-color:#E8483C; border-radius:50%; animation:tspin .8s linear infinite; margin-bottom:12px; }
  .t-load-t { font-family:'Fraunces',serif; font-size:20px; font-weight:700; }
  .t-load-s { font-size:13px; color:#7A6860; margin-bottom:12px; }
  .t-ls { display:flex; align-items:center; gap:9px; font-size:13px; color:#3A2E28; padding:4px 0; }
  .t-ls.a { color:#FF7A6E; } .t-ls.d { color:#6DD16D; }
  .t-ld { width:6px; height:6px; border-radius:50%; background:#2A2018; flex-shrink:0; }
  .t-ls.a .t-ld { background:#E8483C; animation:tdot 1s infinite; }
  .t-ls.d .t-ld { background:#6DD16D; }

  .t-result { display:flex; flex-direction:column; gap:12px; padding:18px; animation:tup .4s ease; }
  .score-card { background:#120E0B; border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden; }
  .score-card-top { padding:16px 18px 14px; border-bottom:1px solid rgba(255,255,255,.06); }
  .score-card-title { font-size:10px; font-family:'Space Mono',monospace; color:#7A6860; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; }
  .score-main { display:flex; align-items:center; gap:14px; }
  .score-circle { width:64px; height:64px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; border:3px solid; }
  .score-circle-num { font-family:'Fraunces',serif; font-size:22px; font-weight:900; line-height:1; }
  .score-circle-den { font-size:9px; font-family:'Space Mono',monospace; opacity:.5; }
  .score-analysis { font-size:13px; color:rgba(242,232,224,.7); line-height:1.7; flex:1; }
  .score-metrics { display:flex; flex-direction:column; gap:10px; padding:14px 18px; }
  .score-metric { display:flex; align-items:center; gap:10px; }
  .score-metric-ico { font-size:15px; width:22px; flex-shrink:0; }
  .score-metric-label { font-size:10px; color:#7A6860; width:80px; flex-shrink:0; font-family:'Space Mono',monospace; text-transform:uppercase; letter-spacing:.5px; }
  .score-metric-bar { flex:1; height:5px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; }
  .score-metric-fill { height:100%; border-radius:3px; }
  .score-metric-val { font-size:10px; font-family:'Space Mono',monospace; font-weight:700; width:80px; text-align:right; flex-shrink:0; }

  .t-sh { font-size:10px; font-family:'Space Mono',monospace; color:#7A6860; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:9px; }
  .t-slist { display:flex; flex-direction:column; gap:9px; }
  .t-sc { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:13px; padding:14px 16px; transition:border-color .2s; }
  .t-sc.ok { border-color:#6DD16D; background:rgba(109,209,109,.04); }
  .t-stop { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .t-tone { font-size:9px; font-family:'Space Mono',monospace; font-weight:700; padding:3px 9px; border-radius:100px; text-transform:uppercase; }
  .tt-P { background:rgba(255,215,0,.1); color:#FFD700; border:1px solid rgba(255,215,0,.2); }
  .tt-C { background:rgba(232,72,60,.1); color:#FF7A6E; border:1px solid rgba(232,72,60,.25); }
  .tt-D { background:rgba(100,200,255,.1); color:#7DCFFF; border:1px solid rgba(100,200,255,.2); }
  .t-cp { background:transparent; border:1px solid rgba(255,255,255,.1); color:#7A6860; padding:5px 12px; border-radius:7px; font-size:11px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; min-height:32px; transition:all .15s; }
  .t-cp.ok { border-color:#6DD16D; color:#6DD16D; background:rgba(109,209,109,.08); }
  .t-msg { font-size:14px; color:#F2E8E0; line-height:1.65; padding:11px 13px; background:rgba(255,255,255,.04); border-radius:9px; border-left:3px solid #E8483C; margin-bottom:7px; }
  .t-why { font-size:12px; color:#7A6860; display:flex; gap:6px; }
  .t-reset { background:transparent; border:1px solid rgba(255,255,255,.1); color:#7A6860; padding:11px 18px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; display:inline-flex; align-items:center; gap:7px; min-height:44px; }
  .t-err { background:rgba(232,72,60,.07); border:1px solid rgba(232,72,60,.25); border-radius:10px; padding:13px 16px; font-size:13px; color:#FF9A90; display:flex; gap:9px; }

  .tab-hist { padding:20px 18px; }
  .tab-section-title { font-family:'Fraunces',serif; font-size:20px; font-weight:900; margin-bottom:4px; }
  .tab-section-sub { font-size:13px; color:#7A6860; margin-bottom:20px; }
  .hist-empty { display:flex; flex-direction:column; align-items:center; padding:50px 20px; text-align:center; }
  .hist-empty-ico { font-size:48px; opacity:.2; margin-bottom:12px; }
  .hist-empty-t { font-family:'Fraunces',serif; font-size:17px; color:rgba(242,232,224,.3); margin-bottom:6px; }
  .hist-empty-s { font-size:13px; color:#3A2E28; }
  .hist-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:14px 16px; margin-bottom:10px; display:flex; align-items:flex-start; gap:13px; }
  .hist-item-ico { width:38px; height:38px; border-radius:10px; background:rgba(232,72,60,.1); border:1px solid rgba(232,72,60,.2); display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .hist-item-app { font-size:10px; font-family:'Space Mono',monospace; color:#FF7A6E; margin-bottom:2px; }
  .hist-item-msg { font-size:13px; color:#F2E8E0; font-weight:600; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; }
  .hist-item-meta { font-size:11px; color:#7A6860; }
  .hist-score { margin-left:auto; font-family:'Space Mono',monospace; font-size:13px; font-weight:700; flex-shrink:0; }

  .tab-profil { padding:20px 18px; display:flex; flex-direction:column; gap:16px; }
  .profil-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#E8483C,#FF7A6E); display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-size:30px; font-weight:700; color:#fff; margin:0 auto 6px; }
  .profil-name { font-family:'Fraunces',serif; font-size:22px; font-weight:900; text-align:center; }
  .profil-plan { font-size:12px; color:#7A6860; text-align:center; font-family:'Space Mono',monospace; margin-top:2px; }
  .profil-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .pstat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px 10px; text-align:center; }
  .pstat-num { font-family:'Fraunces',serif; font-size:24px; font-weight:900; color:#FF7A6E; }
  .pstat-lbl { font-size:10px; color:#7A6860; font-family:'Space Mono',monospace; margin-top:2px; }
  .profil-section { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; overflow:hidden; }
  .profil-row { display:flex; align-items:center; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.05); cursor:pointer; transition:background .15s; }
  .profil-row:last-child { border-bottom:none; }
  .profil-row-ico { font-size:18px; margin-right:13px; }
  .profil-row-label { font-size:14px; font-weight:600; flex:1; }
  .profil-row-val { font-size:13px; color:#7A6860; margin-right:8px; }
  .profil-row-arrow { color:#4A3830; font-size:14px; }

  .tab-premium { padding:20px 18px; }
  .prem-hero { background:linear-gradient(135deg,rgba(232,72,60,.15),rgba(255,122,110,.08)); border:1px solid rgba(232,72,60,.25); border-radius:18px; padding:24px 20px; text-align:center; }
  .prem-crown { font-size:44px; margin-bottom:10px; display:block; }
  .prem-title { font-family:'Fraunces',serif; font-size:24px; font-weight:900; margin-bottom:6px; }
  .prem-title em { font-style:italic; color:#FF7A6E; }
  .prem-sub { font-size:14px; color:#7A6860; line-height:1.6; margin-bottom:20px; }
  .prem-toggle { display:flex; background:rgba(255,255,255,.05); border-radius:10px; padding:4px; margin-bottom:20px; }
  .prem-toggle-btn { flex:1; padding:8px; border-radius:7px; border:none; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; background:transparent; color:#7A6860; }
  .prem-toggle-btn.active { background:#E8483C; color:#fff; }
  .prem-price { text-align:center; margin-bottom:20px; }
  .prem-amount { font-family:'Fraunces',serif; font-size:42px; font-weight:900; color:#F2E8E0; }
  .prem-period { font-size:14px; color:#7A6860; }
  .prem-save { display:inline-block; background:rgba(109,209,109,.1); border:1px solid rgba(109,209,109,.25); color:#6DD16D; font-size:11px; font-family:'Space Mono',monospace; padding:3px 10px; border-radius:100px; margin-left:8px; }
  .prem-features { display:flex; flex-direction:column; gap:9px; margin-bottom:22px; }
  .prem-feat { display:flex; align-items:center; gap:11px; font-size:14px; }
  .prem-feat-ico { width:28px; height:28px; border-radius:8px; background:rgba(232,72,60,.1); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
  .prem-feat-check { color:#6DD16D; font-size:14px; flex-shrink:0; }
  .prem-cta { width:100%; padding:16px; background:#E8483C; color:#fff; border:none; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 20px rgba(232,72,60,.3); min-height:54px; }
  .prem-legal { font-size:11px; color:#4A3830; text-align:center; margin-top:10px; font-family:'Space Mono',monospace; }

  .modal-overlay { position:fixed; top:0;left:0;right:0;bottom:0; background:rgba(0,0,0,.72); z-index:100; display:flex; align-items:flex-end; justify-content:center; animation:mFadeIn .2s ease; }
  .modal-sheet { background:#140F0C; border-radius:20px 20px 0 0; width:100%; max-width:480px; padding:0 0 32px; animation:mSlideUp .25s cubic-bezier(.34,1.1,.64,1); max-height:85vh; overflow-y:auto; }
  .modal-handle { width:36px; height:4px; border-radius:2px; background:rgba(255,255,255,.15); margin:12px auto 0; }
  .modal-header { padding:18px 20px 12px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.07); }
  .modal-title { font-family:'Fraunces',serif; font-size:18px; font-weight:900; }
  .modal-close { background:rgba(255,255,255,.07); border:none; color:#F2E8E0; width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
  .modal-body { padding:16px 20px; }
  .modal-option { display:flex; align-items:center; gap:13px; padding:13px 14px; border-radius:12px; cursor:pointer; border:2px solid transparent; background:rgba(255,255,255,.03); margin-bottom:8px; transition:all .15s; }
  .modal-option.sel { border-color:#E8483C; background:rgba(232,72,60,.08); }
  .modal-option-ico { font-size:22px; flex-shrink:0; }
  .modal-option-label { font-size:14px; font-weight:600; flex:1; }
  .modal-option-sub { font-size:12px; color:#7A6860; margin-top:1px; }
  .modal-radio { width:20px; height:20px; border-radius:50%; border:2px solid #4A3830; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .15s; }
  .modal-option.sel .modal-radio { border-color:#E8483C; background:#E8483C; }
  .modal-radio::after { content:''; width:7px; height:7px; border-radius:50%; background:#fff; opacity:0; transition:opacity .15s; }
  .modal-option.sel .modal-radio::after { opacity:1; }
  .modal-save { width:100%; padding:14px; background:#E8483C; color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; margin-top:6px; min-height:50px; }
  .stars-row { display:flex; justify-content:center; gap:10px; margin:20px 0 10px; }
  .star { font-size:40px; cursor:pointer; transition:transform .15s; filter:grayscale(1) opacity(.3); }
  .star.on { filter:none; transform:scale(1.12); }
  .rating-label { text-align:center; font-family:'Fraunces',serif; font-size:18px; font-weight:700; min-height:26px; margin-bottom:16px; color:#FF7A6E; }
  .rating-feedback { width:100%; background:rgba(255,255,255,.04); border:2px solid rgba(255,255,255,.08); border-radius:12px; padding:12px 14px; color:#F2E8E0; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; resize:none; min-height:80px; margin-bottom:10px; }
  .rating-thanks { text-align:center; padding:20px 0; }
  .rating-thanks-ico { font-size:52px; display:block; margin-bottom:10px; }
  .rating-thanks-t { font-family:'Fraunces',serif; font-size:20px; font-weight:900; margin-bottom:6px; }
  .rating-thanks-s { font-size:14px; color:#7A6860; }
  .priv-page { padding:20px 18px; display:flex; flex-direction:column; gap:14px; }
  .priv-back { display:flex; align-items:center; gap:8px; font-size:14px; color:#7A6860; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; }
  .priv-section-title { font-family:'Fraunces',serif; font-size:20px; font-weight:900; }
  .priv-section-sub { font-size:13px; color:#7A6860; line-height:1.6; }
  .priv-block { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:16px 18px; }
  .priv-block-title { font-size:14px; font-weight:700; margin-bottom:6px; }
  .priv-block-body { font-size:13px; color:#7A6860; line-height:1.75; }
  .priv-danger { border-color:rgba(232,72,60,.25); background:rgba(232,72,60,.04); }
  .priv-danger .priv-block-title { color:#FF7A6E; }
  .priv-action { width:100%; padding:13px; border-radius:11px; font-size:14px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; min-height:48px; margin-top:10px; }
  .priv-action.ghost { background:transparent; border:1px solid rgba(255,255,255,.12); color:#F2E8E0; }
  .priv-action.danger { background:transparent; border:1px solid rgba(232,72,60,.3); color:#FF7A6E; }
  .priv-legal { font-size:11px; color:#3A2E28; line-height:1.7; font-family:'Space Mono',monospace; }
  .delete-confirm { background:rgba(232,72,60,.07); border:1px solid rgba(232,72,60,.25); border-radius:12px; padding:14px 16px; margin-top:10px; }
  .delete-confirm-t { font-size:14px; font-weight:700; color:#FF7A6E; margin-bottom:6px; }
  .delete-confirm-s { font-size:13px; color:#7A6860; margin-bottom:12px; }
  .delete-confirm-btns { display:flex; gap:9px; }
  .btn-cancel { flex:1; padding:11px; background:rgba(255,255,255,.06); border:none; border-radius:9px; color:#F2E8E0; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .btn-delete { flex:1; padding:11px; background:#E8483C; border:none; border-radius:9px; color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; }
`;

const APP_COLORS = {
  Tinder:    { color:"#FE3C72", bg:"rgba(254,60,114,.12)" },
  Bumble:    { color:"#FFC629", bg:"rgba(255,198,41,.12)" },
  Hinge:     { color:"#0CDB95", bg:"rgba(12,219,149,.12)" },
  Instagram: { color:"#C13584", bg:"rgba(193,53,132,.12)" },
  WhatsApp:  { color:"#25D366", bg:"rgba(37,211,102,.12)" },
  Autre:     { color:"#E8483C", bg:"rgba(232,72,60,.12)" },
};
const GOALS = [
  { id:"reply",    icon:"💬", title:"Répondre intelligemment", sub:"La réponse parfaite au dernier message" },
  { id:"relaunch", icon:"🔥", title:"Relancer",                sub:"Elle n'a pas répondu" },
  { id:"date",     icon:"📅", title:"Proposer un RDV",         sub:"Savoir quand et comment" },
  { id:"opener",   icon:"✉️", title:"Premier message",         sub:"Accrocher dès le premier mot" },
];
const APPS_LIST = [
  { id:"tinder",    icon:"🔥", label:"Tinder",    sub:"Le classique" },
  { id:"bumble",    icon:"🐝", label:"Bumble",    sub:"Elle écrit en premier" },
  { id:"hinge",     icon:"💚", label:"Hinge",     sub:"Conçu pour être supprimé" },
  { id:"instagram", icon:"📸", label:"Instagram", sub:"DMs & stories" },
  { id:"whatsapp",  icon:"💬", label:"WhatsApp",  sub:"Après l'échange" },
  { id:"other",     icon:"💌", label:"Autre",     sub:"N'importe quelle app" },
];
const XP = [
  { id:"beginner",     icon:"🌱", label:"Débutant",      sub:"Je galère à lancer des convos" },
  { id:"intermediate", icon:"💪", label:"Intermédiaire", sub:"Des matchs mais peu de dates" },
  { id:"advanced",     icon:"🔥", label:"Avancé",        sub:"Optimiser la conversion" },
  { id:"returning",    icon:"♻️", label:"En pause",      sub:"De retour dans le jeu" },
];
const RATING_LABELS = ["","😬 Pas terrible…","😐 Peut mieux faire","🙂 Plutôt bien","😊 J'aime bien !","🔥 J'adore Get'Rizz !"];

function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(resolve).catch(() => fallback(text, resolve));
    } else { fallback(text, resolve); }
  });
}
function fallback(text, resolve) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly",""); ta.style.cssText="position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand("copy"); } catch(e) {}
  document.body.removeChild(ta); resolve();
}

function scoreColor(n) { return n>=8?"#6DD16D":n>=5?"#FFD700":"#FF7A6E"; }
function flirtLabel(t) { return {Flirty:"🔥 Élevé",Curieux:"✨ Modéré",Neutre:"😐 Faible",Distant:"❄️ Froid"}[t]||"😐 Modéré"; }
function flirtColor(t) { return {Flirty:"#FF7A6E",Curieux:"#FFD700",Neutre:"#7A6860",Distant:"#7DCFFF"}[t]||"#FFD700"; }
function reactLabel(s) { return s>=8?"⚡ Excellente":s>=6?"✅ Bonne":s>=4?"🟡 Moyenne":"🔴 Faible"; }
function reactColor(s) { return s>=6?"#6DD16D":s>=4?"#FFD700":"#FF7A6E"; }
function intentLabel(s) { return s>=8?"💚 Très intéressée":s>=6?"🟡 Intéressée":s>=4?"🤔 Hésitante":"❌ Peu intéressée"; }

function dateMeta(score, tone) {
  const boost = tone==="Flirty"?2:tone==="Curieux"?1:tone==="Neutre"?0:-2;
  const n = score + boost;
  if(n>=10) return {label:"🔥 Quasi certaine",  color:"#FF7A6E", bg:"rgba(255,122,110,.1)"};
  if(n>=8)  return {label:"🟢 Très élevée",     color:"#6DD16D", bg:"rgba(109,209,109,.1)"};
  if(n>=6)  return {label:"🟡 Bonne",           color:"#FFD700", bg:"rgba(255,215,0,.1)"};
  if(n>=4)  return {label:"🟠 Possible",        color:"#FFA040", bg:"rgba(255,160,64,.1)"};
  if(n>=2)  return {label:"🔴 Faible",          color:"#FF7A6E", bg:"rgba(255,122,110,.08)"};
  return     {label:"❄️ Très improbable",       color:"#7DCFFF", bg:"rgba(125,207,255,.08)"};
}

function getRizzScore(score, tone) {
  const base = score * 10;
  const bonus = tone==="Flirty"?5:tone==="Curieux"?2:tone==="Neutre"?0:-5;
  return Math.min(100, Math.max(5, base + bonus));
}

function getRizzPhrase(score, tone) {
  if(score>=90) return {ico:"🔥", txt:"La conversation est en feu — elle est clairement sous le charme. Ne rate pas le moment.", color:"#FF7A6E"};
  if(score>=80) return {ico:"😏", txt:"Très fort. Elle est accrochée, l'ambiance est là. Une bonne réponse et c'est dans la poche.", color:"#FFD700"};
  if(score>=70) return {ico:"✨", txt:"Elle est intéressée, la vibe est bonne. Un peu de confiance et ça décolle.", color:"#FFD700"};
  if(score>=60) return {ico:"💬", txt:"La conversation est légère et sympa. Prends l'initiative pour faire monter le niveau.", color:"#7DCFFF"};
  if(score>=45) return {ico:"🎯", txt:"C'est tiède pour l'instant. Montre-lui quelque chose d'original pour te démarquer.", color:"#7A6860"};
  if(score>=30) return {ico:"🤔", txt:"Elle semble peu engagée. Tente une approche différente — surprise-la.", color:"#7A6860"};
  return {ico:"❄️", txt:"La conversation est froide. Change totalement de registre ou relance sur un nouveau sujet.", color:"#7DCFFF"};
}

function ScoreCard({ result }) {
  const c = scoreColor(result.interest_score);
  const flirtPct = result.tone==="Flirty"?90:result.tone==="Curieux"?60:result.tone==="Neutre"?35:15;
  const reactPct = result.interest_score * 10;
  const intentPct = result.interest_score * 10;
  const rizzPct = getRizzScore(result.interest_score, result.tone);
  const rizzPhrase = getRizzPhrase(rizzPct, result.tone);
  return (
    <div className="score-card">
      <div className="score-card-top">
        <div className="score-card-title">📊 Score conversationnel</div>
        <div className="score-main">
          <div className="score-circle" style={{borderColor:c, background:`${c}18`}}>
            <div className="score-circle-num" style={{color:c}}>{result.interest_score}</div>
            <div className="score-circle-den" style={{color:c}}>/10</div>
          </div>
          <div className="score-analysis">{result.analysis}</div>
        </div>
        {/* ── Rizz Score Banner ── */}
        <div style={{marginTop:14,background:`${rizzPhrase.color}10`,border:`1px solid ${rizzPhrase.color}30`,borderRadius:12,padding:"11px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16}}>{rizzPhrase.ico}</span>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:rizzPhrase.color,textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Rizz Score</span>
            </div>
            <span style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:rizzPhrase.color,lineHeight:1}}>{rizzPct}<span style={{fontSize:13,fontWeight:400,opacity:.7}}>%</span></span>
          </div>
          <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden",marginBottom:9}}>
            <div style={{height:"100%",width:`${rizzPct}%`,background:rizzPhrase.color,borderRadius:2,transition:"width 1.2s cubic-bezier(.34,1.1,.64,1)"}}/>
          </div>
          <div style={{fontSize:12,color:`${rizzPhrase.color}CC`,lineHeight:1.6}}>{rizzPhrase.txt}</div>
        </div>
      </div>
      <div className="score-metrics">
        <div className="score-metric">
          <span className="score-metric-ico">💚</span>
          <span className="score-metric-label">Intérêt</span>
          <div className="score-metric-bar"><div className="score-metric-fill" style={{width:`${intentPct}%`,background:scoreColor(result.interest_score)}}/></div>
          <span className="score-metric-val" style={{color:scoreColor(result.interest_score)}}>{intentLabel(result.interest_score)}</span>
        </div>
        <div className="score-metric">
          <span className="score-metric-ico">🔥</span>
          <span className="score-metric-label">Flirt level</span>
          <div className="score-metric-bar"><div className="score-metric-fill" style={{width:`${flirtPct}%`,background:flirtColor(result.tone)}}/></div>
          <span className="score-metric-val" style={{color:flirtColor(result.tone)}}>{flirtLabel(result.tone)}</span>
        </div>
        <div className="score-metric">
          <span className="score-metric-ico">⚡</span>
          <span className="score-metric-label">Réactivité</span>
          <div className="score-metric-bar"><div className="score-metric-fill" style={{width:`${reactPct}%`,background:reactColor(result.interest_score)}}/></div>
          <span className="score-metric-val" style={{color:reactColor(result.interest_score)}}>{reactLabel(result.interest_score)}</span>
        </div>
        <div style={{marginTop:4,padding:"10px 0 2px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"flex-start",gap:8}}>
          <span style={{fontSize:14}}>💡</span>
          <span style={{fontSize:12,color:"rgba(242,232,224,.6)",lineHeight:1.6}}>{result.recommendation}</span>
        </div>
        {/* ── Date chance ── */}
        <div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15}}>🎯</span>
            <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"#7A6860",textTransform:"uppercase",letterSpacing:".5px"}}>Chance d'obtenir un date</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",padding:"4px 10px",borderRadius:100,background:dateMeta(result.interest_score,result.tone).bg,color:dateMeta(result.interest_score,result.tone).color,border:`1px solid ${dateMeta(result.interest_score,result.tone).color}40`}}>
            {dateMeta(result.interest_score,result.tone).label}
          </span>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        <div className="modal-header"><div className="modal-title">{title}</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
function ModalSelect({ title, options, value, onSave, onClose }) {
  const [sel,setSel]=useState(value);
  return (
    <Modal title={title} onClose={onClose}>
      {options.map(o=>(
        <div key={o.id} className={`modal-option${sel===o.id?" sel":""}`} onClick={()=>setSel(o.id)}>
          <span className="modal-option-ico">{o.icon}</span>
          <div style={{flex:1}}><div className="modal-option-label">{o.label||o.title}</div>{o.sub&&<div className="modal-option-sub">{o.sub}</div>}</div>
          <div className="modal-radio"/>
        </div>
      ))}
      <button className="modal-save" onClick={()=>{onSave(sel);onClose();}}>Enregistrer</button>
    </Modal>
  );
}
function ModalRating({ onClose }) {
  const [stars,setStars]=useState(0);const [hov,setHov]=useState(0);const [fb,setFb]=useState("");const [sent,setSent]=useState(false);
  const active=hov||stars;
  if(sent) return <Modal title="Merci !" onClose={onClose}><div className="rating-thanks"><span className="rating-thanks-ico">🎉</span><div className="rating-thanks-t">Note envoyée !</div></div></Modal>;
  return (
    <Modal title="Noter Get'Rizz" onClose={onClose}>
      <div className="stars-row">{[1,2,3,4,5].map(n=><span key={n} className={`star${n<=active?" on":""}`} onClick={()=>setStars(n)} onMouseEnter={()=>setHov(n)} onMouseLeave={()=>setHov(0)}>⭐</span>)}</div>
      <div className="rating-label">{active?RATING_LABELS[active]:""}</div>
      {stars>0&&<><textarea className="rating-feedback" placeholder="Un commentaire ? (optionnel)" value={fb} onChange={e=>setFb(e.target.value)} rows={3}/><button className="modal-save" onClick={()=>setSent(true)}>Envoyer ✨</button></>}
    </Modal>
  );
}
function PrivacyPage({ onBack, isLoggedIn }) {
  const [showDel,setShowDel]=useState(false);const [deleted,setDeleted]=useState(false);
  return (
    <div className="priv-page">
      <button className="priv-back" onClick={onBack}>‹ Retour au profil</button>
      <div><div className="priv-section-title">🔒 Confidentialité</div><div className="priv-section-sub">Tes données t'appartiennent.</div></div>
      <div className="priv-block"><div className="priv-block-title">📦 Données collectées</div><div className="priv-block-body">Screenshots traités en temps réel, jamais stockés.</div></div>
      <div className="priv-block"><div className="priv-block-title">🤖 Analyse intelligente</div><div className="priv-block-body">Tes conversations sont traitées de manière sécurisée pour générer des réponses adaptées.</div></div>
      <div className="priv-block"><div className="priv-block-title">🛡️ Protection des données</div><div className="priv-block-body">Tes conversations sont utilisées uniquement pour générer tes réponses.</div></div>
      {isLoggedIn&&<div className="priv-block priv-danger"><div className="priv-block-title">🗑️ Supprimer mon compte</div><div className="priv-block-body">Action irréversible.</div>
        {!deleted&&!showDel&&<button className="priv-action danger" onClick={()=>setShowDel(true)}>🗑️ Supprimer</button>}
        {showDel&&!deleted&&<div className="delete-confirm"><div className="delete-confirm-t">Tu es sûr ?</div><div className="delete-confirm-s">Action définitive.</div><div className="delete-confirm-btns"><button className="btn-cancel" onClick={()=>setShowDel(false)}>Annuler</button><button className="btn-delete" onClick={()=>{setShowDel(false);setDeleted(true);ls.del("gr_firstname");ls.del("gr_credits");ls.del("gr_history");}}>Supprimer</button></div></div>}
        {deleted&&<div style={{marginTop:10,fontSize:13,color:"#6DD16D",fontWeight:600}}>✓ Compte supprimé.</div>}
      </div>}
      <div className="priv-legal">Hébergé dans l'UE · RGPD · Pas de revente.</div>
    </div>
  );
}
function ModalWaitlist({ annual, onClose }) {
  const [email,setEmail]=useState("");const [loading,setLoading]=useState(false);const [done,setDone]=useState(false);
  const isValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const submit=async()=>{if(!isValid||loading)return;setLoading(true);await new Promise(r=>setTimeout(r,1100));setLoading(false);setDone(true);};
  if(done) return <Modal title="Tu es sur la liste 🎉" onClose={onClose}><div className="rating-thanks"><span className="rating-thanks-ico">🚀</span><div className="rating-thanks-t">On te prévient !</div><div className="rating-thanks-s" style={{marginBottom:16}}>Email : <strong style={{color:"#FF7A6E"}}>{email}</strong></div><button className="modal-save" onClick={onClose}>Continuer</button></div></Modal>;
  return (
    <Modal title="🔔 Être notifié au lancement" onClose={onClose}>
      <div style={{fontSize:14,color:"#7A6860",lineHeight:1.7,marginBottom:14}}>Premium arrive bientôt. <strong style={{color:"#FF7A6E"}}>Offre exclusive</strong> pour les premiers inscrits.</div>
      <input type="email" placeholder="thomas@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`2px solid ${isValid&&email?"rgba(109,209,109,.4)":"rgba(255,255,255,.08)"}`,borderRadius:12,padding:"13px 16px",color:"#F2E8E0",fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none",marginBottom:12}}/>
      <button className="modal-save" disabled={!isValid||loading} onClick={submit} style={{opacity:!isValid||loading?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {loading?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"tspin .7s linear infinite",display:"inline-block"}}/>Inscription…</>:"🔔 Me prévenir au lancement"}
      </button>
    </Modal>
  );
}

// ── Referral code generator ──
function genRefCode(firstName) {
  const base = (firstName||"USER").toUpperCase().replace(/[^A-Z]/g,"").slice(0,4)||"USER";
  const num = Math.floor(1000+Math.random()*9000);
  return `${base}${num}`;
}

function GuestConversionPopup({ onClose, onShowAuth, title, body }) {
  const _title = title || "Débloque toutes les fonctionnalités";
  const _body  = body  || "Crée un compte gratuit pour sauvegarder tes analyses, garder ton historique et inviter des amis pour gagner des crédits.";
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:"#1A120E",border:"1px solid rgba(232,72,60,.3)",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",boxShadow:"0 -4px 60px rgba(0,0,0,.5)",animation:"mSlideUp .35s cubic-bezier(.34,1.1,.64,1)"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.07)",border:"none",color:"#7A6860",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:32,marginBottom:12}}>🔓</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#F2E8E0",marginBottom:10}}>{_title}</div>
          <div style={{fontSize:13,color:"#7A6860",lineHeight:1.6}}>{_body}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>{onClose();onShowAuth();}} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(232,72,60,.35)"}}>
            🚀 Créer mon compte
          </button>
          <div style={{textAlign:"center",fontSize:12,color:"#7A6860"}}>Déjà +1200 analyses générées aujourd'hui 🔥</div>
          <button onClick={()=>{onClose();onShowAuth();}} style={{width:"100%",padding:"13px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,color:"#F2E8E0",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Se connecter
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:14}}>
          <span onClick={onClose} style={{fontSize:12,color:"#7A6860",textDecoration:"underline",cursor:"pointer"}}>Non merci</span>
        </div>
      </div>
    </div>
  );
}

function ReferralPopup({ onClose, setCredits, userEmail }) {
  const [refCode] = useState(()=>{
    try{
      const key = userEmail ? "gr_ref_code_"+userEmail.replace(/[^a-z0-9]/gi,"_") : "gr_ref_code";
      let c=ls.get(key); if(!c){c=genRefCode(ls.get("gr_firstname")||"");ls.set(key,c);} return c;
    }catch(e){ return "USER"+Math.floor(1000+Math.random()*9000); }
  });
  const [copied,setCopied] = useState(false);
  const [claimed,setClaimed] = useState(false);
  const refLink = `https://getrizz.app/?ref=${refCode}`;
  const handleCopy = async() => {
    try{ await navigator.clipboard.writeText(refLink); }catch(e){ const t=document.createElement("textarea");t.value=refLink;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t); }
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };
  const handleShare = async() => {
    if(navigator.share){ try{ await navigator.share({title:"Get'Rizz 🔥",text:"J'ai boosté mes convos dating avec cette IA — essaie avec mon code !",url:refLink}); }catch(e){} }
    else { handleCopy(); }
  };
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,margin:"0 0 70px",background:"#1A120E",border:"1px solid rgba(255,198,41,.25)",borderRadius:24,padding:"24px 20px 20px",boxShadow:"0 -8px 60px rgba(255,198,41,.08)",animation:"mSlideUp .4s cubic-bezier(.34,1.1,.64,1)"}}>
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.07)",border:"none",color:"#7A6860",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:8}}>🎁</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"#F2E8E0",marginBottom:6}}>Invite un pote, gagne des crédits</div>
          <div style={{fontSize:13,color:"#7A6860",lineHeight:1.6}}>Partage ton lien. Pour chaque ami qui s'inscrit, vous gagnez <strong style={{color:"#FFC629"}}>+5 crédits</strong> chacun.</div>
        </div>
        {/* Rewards row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
          {[{ico:"🔥",val:"+5",lbl:"Pour toi",color:"#E8483C"},{ico:"🎁",val:"+3",lbl:"Pour ton ami",color:"#FFC629"}].map(({ico,val,lbl,color})=>(
            <div key={lbl} style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"12px",textAlign:"center",border:`1px solid ${color}25`}}>
              <div style={{fontSize:20,marginBottom:4}}>{ico}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color}}>{val} crédits</div>
              <div style={{fontSize:11,color:"#7A6860",marginTop:2}}>{lbl}</div>
            </div>
          ))}
        </div>
        {/* Code block */}
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"12px 14px",marginBottom:14,border:"1px dashed rgba(255,255,255,.1)"}}>
          <div style={{fontSize:10,fontFamily:"'Space Mono',monospace",color:"#7A6860",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Ton lien de parrainage</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <div style={{fontSize:12,color:"#F2E8E0",fontFamily:"'Space Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>getrizz.app?ref=<span style={{color:"#FFC629",fontWeight:700}}>{refCode}</span></div>
            <button onClick={handleCopy} style={{background:copied?"rgba(109,209,109,.15)":"rgba(232,72,60,.15)",border:`1px solid ${copied?"rgba(109,209,109,.3)":"rgba(232,72,60,.3)"}`,color:copied?"#6DD16D":"#FF7A6E",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>
              {copied?"✅ Copié !":"📋 Copier"}
            </button>
          </div>
        </div>
        {/* Share button */}
        <button onClick={handleShare} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(232,72,60,.35)",marginBottom:10}}>
          🚀 Partager mon lien
        </button>
        <div style={{textAlign:"center",marginBottom:8}}>
          <span onClick={()=>{ ls.set("gr_referral_dismissed","1"); onClose(); }} style={{fontSize:12,color:"#7A6860",textDecoration:"underline",cursor:"pointer"}}>Non merci</span>
        </div>
        <div style={{textAlign:"center",fontSize:11,color:"rgba(242,232,224,.25)"}}>Les crédits sont ajoutés automatiquement à l'inscription de ton ami.</div>
      </div>
    </div>
  );
}

// ── Referral card in Profil ──
function ReferralCard({ setCredits, userEmail }) {
  const [refCode] = useState(()=>{
    try{
      const key = userEmail ? "gr_ref_code_"+userEmail.replace(/[^a-z0-9]/gi,"_") : "gr_ref_code";
      let c=ls.get(key); if(!c){c=genRefCode(ls.get("gr_firstname")||"");ls.set(key,c);} return c;
    }catch(e){ return "USER"+Math.floor(1000+Math.random()*9000); }
  });
  const [refCount] = useState(()=>{ return parseInt(ls.get("gr_ref_count")||"0"); });
  const [copied,setCopied] = useState(false);
  const refLink = `https://getrizz.app/?ref=${refCode}`;
  const handleCopy = async() => {
    try{ await navigator.clipboard.writeText(refLink); }catch(e){ const t=document.createElement("textarea");t.value=refLink;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t); }
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };
  const handleShare = async() => {
    if(navigator.share){ try{ await navigator.share({title:"Get'Rizz 🔥",text:"J'ai boosté mes convos dating avec cette IA — essaie avec mon code !",url:refLink}); }catch(e){} }
    else { handleCopy(); }
  };
  return(
    <div style={{background:"linear-gradient(135deg,rgba(232,72,60,.08),rgba(255,198,41,.05))",border:"1px solid rgba(255,198,41,.2)",borderRadius:16,padding:"16px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🎁</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#F2E8E0"}}>Invite un ami</div>
            <div style={{fontSize:11,color:"#7A6860"}}>+5 crédits chacun</div>
          </div>
        </div>
        {refCount>0&&<div style={{background:"rgba(255,198,41,.12)",border:"1px solid rgba(255,198,41,.25)",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#FFC629"}}>🏆 {refCount} invité{refCount>1?"s":""}</div>}
      </div>
      {/* Code */}
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"#F2E8E0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
          ref=<span style={{color:"#FFC629",fontWeight:700}}>{refCode}</span>
        </div>
        <button onClick={handleCopy} style={{background:copied?"rgba(109,209,109,.15)":"rgba(232,72,60,.12)",border:`1px solid ${copied?"rgba(109,209,109,.3)":"rgba(232,72,60,.25)"}`,color:copied?"#6DD16D":"#FF7A6E",padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>
          {copied?"✅":"📋"} {copied?"Copié !":"Copier"}
        </button>
      </div>
      <button onClick={handleShare} style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 14px rgba(232,72,60,.3)"}}>
        🚀 Partager mon lien
      </button>
    </div>
  );
}

function TabAnalyse({ firstName, credits, setCredits, history, setHistory, replayData, setReplayData, isLoggedIn, isPremium, onShowAuth, userEmail, supaUserId }) {
  const [imgPreview,setImgPreview]=useState(null);const [imgBase64,setImgBase64]=useState(null);
  const fileEl=useRef(null);const [showGuestLimitUpload,setShowGuestLimitUpload]=useState(false);const [app,setApp]=useState("Tinder");const [goal,setGoal]=useState("reply");
  const [loading,setLoading]=useState(false);const [result,setResult]=useState(null);const [error,setError]=useState(null);
  const [loadStep,setLoadStep]=useState(0);const [copied,setCopied]=useState(null);const [regening,setRegening]=useState(false);const [showCta,setShowCta]=useState(false);
  const [toast,setToast]=useState(null);
  const [showReferral,setShowReferral]=useState(false);
  const [showGuestLimit,setShowGuestLimit]=useState(false);
  const effectiveCredits = (!isLoggedIn && !DEV_MODE) ? Math.min(credits, 2) : credits;
  const [regenKey,setRegenKey]=useState(0);

  // ── Pré-remplir depuis l'historique ──
  useEffect(()=>{
    if(!replayData) return;
    setApp(replayData.app);
    setGoal(replayData.goal);
    setResult(null);setImgPreview(null);setImgBase64(null);setError(null);
    setToast(`⚡ App et objectif pré-remplis depuis ton historique !`);
    setTimeout(()=>setToast(null), 3500);
    setReplayData(null);
  },[replayData]);
  const LS=["🧠 Analyse du ton de la conversation…","💬 Détection du niveau de flirt…","🔥 Calcul des meilleures réponses…","✨ Finalisation de ton boost…"];
  const handleFile=file=>{if(!file||!file.type.startsWith("image/"))return;const r=new FileReader();r.onload=e=>{setImgPreview(e.target.result);setImgBase64(e.target.result.split(",")[1]);setResult(null);setError(null);};r.readAsDataURL(file);};
  const handleAnalyze=async()=>{
    if(!isLoggedIn && !DEV_MODE && history.length >= 2) { setShowGuestLimit(true); return; }
    if(isLoggedIn && !isPremium && !DEV_MODE && credits <= 0) { setShowCta(true); return; }
    if(!imgBase64||loading)return;
    setLoading(true);setResult(null);setError(null);
    for(let i=0;i<LS.length;i++){setLoadStep(i);await new Promise(r=>setTimeout(r,650));}
    try{
      const gm={reply:"répondre intelligemment au dernier message",relaunch:"relancer la conversation",date:"proposer un rendez-vous",opener:"envoyer un premier message accrocheur"};
      const res=await fetch("https://getrizz-app-production.up.railway.app/api/analyze",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"Tu es Get'Rizz. Réponds UNIQUEMENT en JSON valide sans markdown.",messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgBase64}},{type:"text",text:`App:${app} Objectif:${gm[goal]}\nJSON:{"interest_score":<1-10>,"tone":"<Flirty|Neutre|Curieux|Distant>","recommendation":"<phrase courte>","analysis":"<2 phrases max>","suggestions":[{"tone":"Chill","message":"<msg>","why":"<phrase>"},{"tone":"Bold","message":"<msg>","why":"<phrase>"},{"tone":"Cut","message":"<msg>","why":"<phrase>"}]}`}]}]})});
      if(!res.ok){const e=await res.json().catch(()=>{});throw new Error(e?.error?.message||`Erreur ${res.status}`);}
      const data=await res.json();
      const r=JSON.parse((data.content?.[0]?.text||"").replace(/```json|```/g,"").trim());
      setResult(r);

      if(!DEV_MODE && isLoggedIn && !isPremium) {
        setCredits(c=>Math.max(0,c-1));
if(supaUserId) { const newCredits = Math.max(0, credits-1); const {error} = await supabase.from('profiles').update({credits: newCredits}).eq('user_id', supaUserId);  }
      }
      setHistory(h=>[{id:Date.now(),app,goal,score:r.interest_score,preview:r.suggestions?.[0]?.message||"",ts:new Date()},...h].slice(0,20));
      if(!DEV_MODE) setTimeout(()=>setShowCta(true), 3500);
      // Show referral popup after first analysis ever
      const isFirstAnalysis = history.length === 0;
      if(isFirstAnalysis) setTimeout(()=>setShowReferral(true), 5000);
    }catch(e){setError(e.message);}finally{setLoading(false);setLoadStep(0);}
  };
  const handleRegen=async()=>{
    if(!isLoggedIn && !DEV_MODE && history.length >= 2) { setShowGuestLimit(true); return; }
    if(!imgBase64||regening)return;
    setRegening(true);setCopied(null);
    try{
      const gm={reply:"répondre intelligemment au dernier message",relaunch:"relancer la conversation",date:"proposer un rendez-vous",opener:"envoyer un premier message accrocheur"};
      const res=await fetch("https://getrizz-app-production.up.railway.app/api/analyze",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:"Tu es Get'Rizz. Réponds UNIQUEMENT en JSON valide sans markdown.",messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgBase64}},{type:"text",text:`App:${app} Objectif:${gm[goal]}\nGénère 3 NOUVELLES suggestions différentes des précédentes, plus créatives et variées.\nJSON:{"suggestions":[{"tone":"Chill","message":"<msg>","why":"<phrase>"},{"tone":"Bold","message":"<msg>","why":"<phrase>"},{"tone":"Cut","message":"<msg>","why":"<phrase>"}]}`}]}]})});
      if(!res.ok)throw new Error(`Erreur ${res.status}`);
      const data=await res.json();
      const r=JSON.parse((data.content?.[0]?.text||"").replace(/```json|```/g,"").trim());
      if(r.suggestions){ setResult(prev=>({...prev,suggestions:r.suggestions})); setRegenKey(k=>k+1); }
    }catch(e){setError(e.message);}finally{setRegening(false);}
  };
  const handleCopy=async(msg,i)=>{await copyToClipboard(msg);setCopied(i);setTimeout(()=>setCopied(null),2200);};

  if(loading) return(
    <div className="t-loading">
      <div className="t-spinner"/>
      <div className="t-load-t">Boost en cours…</div>
      <div className="t-load-s">Get'Rizz prépare tes meilleures réponses 🔥</div>
      <div style={{display:"flex",flexDirection:"column",gap:4,textAlign:"left"}}>
        {LS.map((s,i)=><div key={i} className={`t-ls${i<loadStep?" d":i===loadStep?" a":""}`}><div className="t-ld"/>{i<loadStep?"✓ ":""}{s}</div>)}
      </div>
      {!DEV_MODE&&<div style={{marginTop:20,fontSize:11,color:"#3A2E28",fontFamily:"'Space Mono',monospace",textAlign:"center"}}>👑 Les utilisateurs Premium obtiennent des analyses plus détaillées</div>}
    </div>
  );

  if(result) return(
    <div className="t-result">
      {/* ── Guest limit Popup ── */}
      {showGuestLimit&&<GuestConversionPopup onClose={()=>setShowGuestLimit(false)} onShowAuth={onShowAuth} title="Crée un compte pour continuer" body="Les comptes invités sont limités à 2 analyses. Crée un compte gratuit pour analyser plus de conversations et sauvegarder ton historique."/>}
      {/* ── Referral / Guest conversion Popup ── */}
      {showReferral&&(isLoggedIn
        ? <ReferralPopup onClose={()=>setShowReferral(false)} setCredits={setCredits} userEmail={userEmail}/>
        : <GuestConversionPopup onClose={()=>setShowReferral(false)} onShowAuth={onShowAuth}/>
      )}
      {showCta&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px"}} onClick={()=>setShowCta(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,margin:"0 16px",background:"#1A120E",border:"1px solid rgba(232,72,60,.35)",borderRadius:20,padding:"22px 20px 20px",boxShadow:"0 -4px 60px rgba(232,72,60,.15)",animation:"mSlideUp .35s cubic-bezier(.34,1.1,.64,1)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:28}}>👑</span>
                <div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:900,color:"#F2E8E0",lineHeight:1.2}}>Passe à Premium</div>
                  <div style={{fontSize:11,color:"#FF7A6E",fontFamily:"'Space Mono',monospace",marginTop:2}}>7 jours gratuits · Sans engagement</div>
                </div>
              </div>
              <button onClick={()=>setShowCta(false)} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#7A6860",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
              {[["⚡","Analyses & regénérations illimitées"],["🎯","Suggestions ultra-personnalisées"],["📊","Score conversationnel avancé"],["🚀","Accès aux nouvelles fonctionnalités"]].map(([ico,txt])=>(
                <div key={txt} style={{display:"flex",alignItems:"center",gap:9,fontSize:13,color:"rgba(242,232,224,.75)"}}>
                  <span style={{width:24,height:24,background:"rgba(232,72,60,.1)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{ico}</span>
                  {txt}
                </div>
              ))}
            </div>
            <button style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:13,fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 20px rgba(232,72,60,.3)",marginBottom:8}}>
              🔥 Commencer mon essai gratuit
            </button>
            <div style={{textAlign:"center",fontSize:11,color:"#3A2E28",fontFamily:"'Space Mono',monospace"}}>Annulable à tout moment · 9€/mois ensuite</div>
          </div>
        </div>
      )}
      <ScoreCard result={result}/>
      <div>
        <div className="t-sh">💬 3 meilleures réponses</div>
        <div className="t-slist" key={regenKey}>
          {result.suggestions?.map((s,i)=>(
            <div key={i} className={`t-sc${copied===i?" ok":""}`} style={{animation:`cardIn .45s cubic-bezier(.34,1.1,.64,1) both`,animationDelay:`${i*120}ms`}}>
              <div className="t-stop">
                <span className={`t-tone tt-${s.tone==="Chill"?"P":s.tone==="Bold"?"C":"D"}`}>{s.tone==="Chill"?"Chill 😎":s.tone==="Bold"?"Bold 🔥":"Cut ⚡"}</span>
                <button className={`t-cp${copied===i?" ok":""}`} onClick={()=>handleCopy(s.message,i)}>{copied===i?"✅ Copié — bonne chance champion 🔥":"📋 Copier la réponse"}</button>
              </div>
              <div className="t-msg">{s.message}</div>
              <div className="t-why"><span style={{color:"#FF7A6E",flexShrink:0}}>💡</span>{s.why}</div>
            </div>
          ))}
        </div>
        <button onClick={isLoggedIn ? handleRegen : ()=>setShowReferral(true)} disabled={regening} style={{width:"100%",marginTop:10,padding:"13px 16px",background:"rgba(255,255,255,.03)",border:`1px solid ${!isLoggedIn?"rgba(232,72,60,.2)":"rgba(255,255,255,.1)"}`,borderRadius:12,color:regening?"#4A3830":"#F2E8E0",fontSize:14,fontWeight:600,cursor:regening?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s",minHeight:48}}>
          {regening
            ?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.2)",borderTopColor:"#FF7A6E",borderRadius:"50%",animation:"tspin .7s linear infinite",display:"inline-block",flexShrink:0}}/>Génération en cours…</>
            : isLoggedIn
              ? "🎲 Regénérer d'autres réponses"
              : "🔒 Regénérer d'autres réponses"
          }
        </button>
      </div>
      {!DEV_MODE&&<div style={{background:"linear-gradient(135deg,rgba(232,72,60,.08),rgba(255,122,110,.04))",border:"1px solid rgba(232,72,60,.2)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18,flexShrink:0}}>⚡</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:"#F2E8E0",fontWeight:600,marginBottom:2}}>Besoin de plus de réponses ?</div>
          <div style={{fontSize:11,color:"#7A6860",lineHeight:1.5}}>Premium génère des variantes illimitées.</div>
        </div>
      </div>}
      {isLoggedIn
        ? <button className="t-reset" onClick={()=>{ setResult(null);setImgPreview(null);setImgBase64(null);setError(null); }}>← Nouveau screenshot</button>
        : <button className="t-reset" onClick={()=>setShowReferral(true)} style={{borderColor:"rgba(232,72,60,.3)",color:"#FF7A6E",width:"100%",justifyContent:"center"}}>🔒 Créer un compte pour analyser un nouveau screenshot</button>
      }
    </div>
  );

  return(
    <div className="tab-analyse">
      {showGuestLimitUpload&&<GuestConversionPopup onClose={()=>setShowGuestLimitUpload(false)} onShowAuth={onShowAuth} title="Crée un compte pour continuer" body="Les comptes invités sont limités à 2 analyses. Crée un compte gratuit pour analyser plus de conversations et sauvegarder ton historique."/>}
      {/* ── Toast notification ── */}
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:300,background:"#1A120E",border:"1px solid rgba(232,72,60,.4)",borderRadius:12,padding:"11px 18px",fontSize:13,fontWeight:600,color:"#FF7A6E",whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,.4)",animation:"tup .3s ease"}}>{toast}</div>}
      <input ref={fileEl} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      <div><div className="tab-h1">{firstName?<>Prêt, <em>{firstName}</em>&nbsp;?</>:<>C'est <em>parti&nbsp;!</em></>}</div><div className="tab-sub">Upload le screenshot — 3 réponses en 30s.</div></div>
      {error&&<div className="t-err"><span>⚠️</span><div><div style={{fontWeight:700,marginBottom:3}}>Erreur</div><div style={{color:"rgba(255,154,144,.75)"}}>{error}</div></div></div>}
      <div><span className="t-lbl">Application</span><div className="t-apps">
        {[{v:"Tinder",e:"🔥"},{v:"Bumble",e:"🐝"},{v:"Hinge",e:"💚"},{v:"Instagram",e:"📸"},{v:"WhatsApp",e:"💬"},{v:"Autre",e:"💌"}].map(a=>{
          const active=app===a.v;const c=APP_COLORS[a.v];
          return <button key={a.v} className={`t-app${active?" s":""}`} style={active?{"--app-color":c.color,"--app-bg":c.bg}:{}} onClick={()=>setApp(a.v)}><span className="e">{a.e}</span>{a.v}</button>;
        })}
      </div></div>
      <div><span className="t-lbl">Objectif</span><div className="t-goals">
        {[{v:"reply",e:"💬",l:"Répondre"},{v:"relaunch",e:"🔥",l:"Relancer"},{v:"date",e:"📅",l:"RDV"},{v:"opener",e:"✉️",l:"Premier msg"}].map(g=>(
          <button key={g.v} className={`t-goal${goal===g.v?" s":""}`} onClick={()=>setGoal(g.v)}><span>{g.e}</span>{g.l}</button>
        ))}
      </div></div>
      <div><span className="t-lbl">Screenshot</span>
        <div className={`t-upload${imgPreview?" has":""}`} onClick={()=>{ if(!imgPreview){ if(!isLoggedIn&&!DEV_MODE&&history.length>=2){setShowGuestLimitUpload(true);return;} fileEl.current?.click(); } }}>
          {imgPreview?<><img src={imgPreview} alt="screenshot"/><button className="t-rm" onClick={e=>{e.stopPropagation();setImgPreview(null);setImgBase64(null);}}>✕</button></>:<div className="t-upload-inner"><div className="t-upload-ico">📱</div><div className="t-upload-title">Balance ton screenshot ici</div><div className="t-upload-sub"><strong>Tinder · Bumble · Hinge</strong><br/>Instagram · WhatsApp · toute app</div></div>}
        </div>
      </div>
      <button className="t-btn" disabled={!imgBase64} onClick={handleAnalyze} style={(!isLoggedIn&&!DEV_MODE&&history.length>=2)?{background:"rgba(255,255,255,.05)",boxShadow:"none"}:{}}>
        {(!isLoggedIn&&!DEV_MODE&&history.length>=2)?"🔒 Analyser ma conversation":"⚡ Analyser ma conversation"}
      </button>
    </div>
  );
}

function TabHistorique({ history, onReplay }) {
  const appEmoji = {Tinder:"🔥",Bumble:"🐝",Hinge:"💚",Instagram:"📸",WhatsApp:"💬",Autre:"💌"};
  const appColor = {Tinder:"#FE3C72",Bumble:"#FFC629",Hinge:"#0CDB95",Instagram:"#C13584",WhatsApp:"#25D366",Autre:"#E8483C"};
  const goalLabel = {reply:"Répondre",relaunch:"Relancer",date:"Proposer un RDV",opener:"Premier message"};
  const goalEmoji = {reply:"💬",relaunch:"🔥",date:"📅",opener:"✉️"};
  const intLabel = n => n>=8?"Très intéressée":n>=6?"Intéressée":n>=4?"Hésitante":"Peu intéressée";
  const intEmoji = n => n>=8?"💚":n>=6?"🟡":n>=4?"🤔":"❌";
  const intColor = n => n>=8?"#6DD16D":n>=6?"#FFD700":n>=4?"#FFA040":"#FF7A6E";

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if(diff < 60) return "À l'instant";
    if(diff < 3600) return `Il y a ${Math.floor(diff/60)}min`;
    if(diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`;
    return `Il y a ${Math.floor(diff/86400)}j`;
  }

  return(
    <div className="tab-hist">
      <div style={{padding:"20px 18px 0"}}>
        <div className="tab-section-title">Historique</div>
        <div className="tab-section-sub">{history.length} analyse{history.length!==1?"s":""} · session en cours</div>
      </div>
      {history.length===0
        ? <div className="hist-empty">
            <div className="hist-empty-ico">📋</div>
            <div className="hist-empty-t">Aucune analyse encore</div>
            <div className="hist-empty-s">Lance ta première analyse pour voir tes résultats ici</div>
          </div>
        : <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
            {history.map((h,idx)=>{
              const ac = appColor[h.app]||"#E8483C";
              const ae = appEmoji[h.app]||"💌";
              return(
                <div key={h.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,overflow:"hidden",transition:"border-color .2s"}}>
                  {/* Header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 10px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:32,height:32,borderRadius:9,background:`${ac}18`,border:`1px solid ${ac}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{ae}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#F2E8E0"}}>{h.app}</div>
                        <div style={{fontSize:10,color:"#7A6860",fontFamily:"'Space Mono',monospace",marginTop:1}}>🕒 {timeAgo(h.ts)}</div>
                      </div>
                    </div>
                    {/* Score badge */}
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:intColor(h.score),lineHeight:1}}>{h.score}<span style={{fontSize:11,opacity:.6}}>/10</span></div>
                      <div style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:"#7A6860",marginTop:1}}>SCORE</div>
                    </div>
                  </div>
                  {/* Stats row */}
                  <div style={{display:"flex",padding:"10px 14px",gap:6}}>
                    <div style={{flex:1,background:"rgba(255,255,255,.03)",borderRadius:9,padding:"8px 10px",display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:"#4A3830",textTransform:"uppercase",letterSpacing:".5px"}}>Intérêt</div>
                      <div style={{fontSize:12,fontWeight:700,color:intColor(h.score)}}>{intEmoji(h.score)} {intLabel(h.score)}</div>
                    </div>
                    <div style={{flex:1,background:"rgba(255,255,255,.03)",borderRadius:9,padding:"8px 10px",display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:"#4A3830",textTransform:"uppercase",letterSpacing:".5px"}}>Objectif</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#F2E8E0"}}>{goalEmoji[h.goal]} {goalLabel[h.goal]}</div>
                    </div>
                  </div>
                  {/* Preview message */}
                  {h.preview&&<div style={{margin:"0 14px 10px",fontSize:12,color:"rgba(242,232,224,.45)",fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",paddingLeft:8,borderLeft:"2px solid rgba(232,72,60,.3)"}}>
                    "{h.preview}"
                  </div>}
                  {/* Replay button */}
                  <div style={{padding:"0 14px 12px"}}>
                    <button onClick={()=>onReplay(h)} style={{width:"100%",padding:"9px",background:"rgba(232,72,60,.08)",border:"1px solid rgba(232,72,60,.2)",borderRadius:9,color:"#FF7A6E",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .15s"}}>
                      🔍 Réouvrir l'analyse
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}

// ── Notification messages catalog (for OneSignal) ──
const NOTIF_CATALOG = {
  inactive: [
    {title:"💬 Besoin d'un boost ?", body:"Une réponse optimisée peut changer toute une conversation."},
    {title:"🔥 Relance la conversation.", body:"Tes matchs attendent. Get'Rizz t'aide à trouver les bons mots."},
    {title:"📱 Toujours en train de ghoster ?", body:"Non — c'est eux qui ghostent. Améliore ton approche."},
    {title:"⚡ Ta prochaine réponse peut tout changer.", body:"Analyse ta convo en 10 secondes."},
  ],
  motivation: [
    {title:"🔥 3 nouveaux matchs aujourd'hui ?", body:"Assure tes réponses avec Get'Rizz."},
    {title:"💘 Le bon message au bon moment.", body:"Ne laisse pas filer cette conversation."},
    {title:"🎯 Score conversationnel bas ?", body:"On t'aide à remonter ça en une analyse."},
    {title:"🏆 Les meilleurs séducteurs ont un coach.", body:"Le tien s'appelle Get'Rizz."},
  ],
  postUse: [
    {title:"💬 Une réponse prête à être envoyée ?", body:"Tu avais analysé une convo ce matin. Elle attend toujours."},
    {title:"⏳ Ta dernière analyse, c'était il y a quelques heures.", body:"Elle est peut-être encore temps de relancer."},
  ],
  tips: [
    {title:"💡 Astuce du jour", body:"Un message court et curieux génère 3x plus de réponses qu'un pavé."},
    {title:"📊 Le saviez-vous ?", body:"Les messages envoyés entre 20h et 22h ont le meilleur taux de réponse."},
    {title:"🧠 Conseil pro", body:"Toujours finir par une question ouverte pour relancer la balle."},
  ]
};

function Toggle({on, onToggle}) {
  return(
    <span onClick={onToggle} style={{marginLeft:"auto",width:40,height:22,borderRadius:11,background:on?"#E8483C":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",padding:"3px",transition:"background .2s",cursor:"pointer",flexShrink:0}}>
      <span style={{width:16,height:16,borderRadius:"50%",background:"#fff",marginLeft:on?18:0,transition:"margin .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
    </span>
  );
}


function NotifCenter({notifPrefs, savePrefs, setShowNotifCenter, onToggleMain}) {
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={()=>setShowNotifCenter(false)}>
      <div style={{background:"#141009",borderRadius:"20px 20px 0 0",padding:"0 0 32px",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
          <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.15)"}}/>
        </div>
        {/* Header */}
        <div style={{padding:"16px 20px 20px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#F2E8E0",fontFamily:"'Fraunces',serif"}}>🔔 Notifications</div>
          <div style={{fontSize:12,color:"#7A6860",marginTop:4}}>1 à 3 notifications max par semaine — jamais de spam.</div>
        </div>
        {/* Master toggle */}
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#F2E8E0"}}>Activer les notifications</div>
              <div style={{fontSize:12,color:"#7A6860",marginTop:2}}>Autorise Get'Rizz à t'envoyer des notifications</div>
            </div>
            <Toggle on={notifPrefs.enabled} onToggle={onToggleMain}/>
          </div>
        </div>
        {/* Sub-categories */}
        <div style={{padding:"12px 20px 0",opacity:notifPrefs.enabled?1:.4,pointerEvents:notifPrefs.enabled?"auto":"none",transition:"opacity .2s"}}>
          <div style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:"#7A6860",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>Catégories</div>
          {[
            {key:"reminders", ico:"💬", label:"Rappels de réponse", desc:"\"💬 Besoin d'un boost pour ta conversation ?\" — 48h après ta dernière analyse"},
            {key:"tips",      ico:"💡", label:"Conseils de conversation", desc:"Astuces, stats et moments clés pour améliorer ton approche"},
            {key:"news",      ico:"🚀", label:"Nouveautés Get'Rizz", desc:"Nouvelles features, mises à jour importantes"},
          ].map(({key,ico,label,desc})=>(
            <div key={key} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <div style={{flex:1,paddingRight:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:16}}>{ico}</span>
                  <span style={{fontSize:14,fontWeight:600,color:"#F2E8E0"}}>{label}</span>
                </div>
                <div style={{fontSize:12,color:"#7A6860",lineHeight:1.5}}>{desc}</div>
              </div>
              <Toggle on={notifPrefs[key]} onToggle={()=>savePrefs({...notifPrefs,[key]:!notifPrefs[key]})}/>
            </div>
          ))}
          {/* Fréquence info */}
          <div style={{marginTop:16,background:"rgba(232,72,60,.06)",border:"1px solid rgba(232,72,60,.15)",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:12,color:"rgba(242,232,224,.5)",lineHeight:1.6}}>
              📅 <strong style={{color:"rgba(242,232,224,.7)"}}>Fréquence :</strong> Maximum 3 notifications par semaine. On ne t'enverra jamais de spam ni de messages génériques du type "Reviens sur l'app".
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabProfil({ firstName, credits, setCredits, history, isLoggedIn, userEmail, onShowAuth, onLogout }) {
  const [modal,setModal]=useState(null);const [privacy,setPrivacy]=useState(false);
  const [goal,setGoal]=useState("reply");const [app,setApp]=useState("Tinder");const [level,setLevel]=useState("beginner");
  const [showNotifCenter,setShowNotifCenter]=useState(false);
  const [notifPrefs,setNotifPrefs]=useState(()=>{
    try{ const _np=ls.get("gr_notif_prefs"); return _np?JSON.parse(_np):{enabled:false,tips:true,reminders:true,news:true}; }
    catch(e){ return {enabled:false,tips:true,reminders:true,news:true}; }
  });
  const savePrefs = (prefs) => {
    setNotifPrefs(prefs);
    ls.set("gr_notif_prefs", JSON.stringify(prefs));
    if(typeof window!=="undefined"&&window.OneSignal){
      prefs.enabled ? window.OneSignal.registerForPushNotifications() : window.OneSignal.setSubscription(false);
    }
  };
  const toggleMain = () => {
    if(!notifPrefs.enabled && "Notification" in window){
      Notification.requestPermission().then(p=>{
        if(p==="granted"){ savePrefs({...notifPrefs,enabled:true}); }
        else{ alert("Active les notifications dans les réglages de ton navigateur 🔔"); }
      });
    } else { savePrefs({...notifPrefs,enabled:!notifPrefs.enabled}); }
  };
  const goalLabel={reply:"Répondre",relaunch:"Relancer",date:"RDV",opener:"Premier msg"};
  const appLabel={Tinder:"Tinder",Bumble:"Bumble",Hinge:"Hinge",Instagram:"Instagram",WhatsApp:"WhatsApp",Autre:"Autre"};
  const levelLabel={beginner:"Débutant",intermediate:"Intermédiaire",advanced:"Avancé",returning:"En pause"};
  const avgScore=history.length>0?Math.round(history.reduce((a,h)=>a+h.score,0)/history.length*10)/10:null;

  const avatarKey = userEmail ? "gr_"+userEmail.replace(/[^a-z0-9]/gi,"_")+"_avatar" : "gr_guest_avatar";
  const [avatarUrl,setAvatarUrl]=useState(()=>{ return ls.get(avatarKey)||null; });
  const [avatarAnim,setAvatarAnim]=useState(false);
  const handleAvatarUpload=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{const b64=ev.target.result;setAvatarUrl(b64);setAvatarAnim(true);setTimeout(()=>setAvatarAnim(false),2000);ls.set(avatarKey,b64);};reader.readAsDataURL(file);};

  if(privacy) return <PrivacyPage onBack={()=>setPrivacy(false)} isLoggedIn={isLoggedIn}/>;
  return(
    <>
      <div className="tab-profil">
        <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>isLoggedIn?document.getElementById("avatar-input").click():onShowAuth()}>
            {avatarUrl
              ?<div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",border:"3px solid rgba(232,72,60,.5)",margin:"0 auto"}}><img src={avatarUrl} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
              :<div className="profil-avatar">{firstName?firstName[0].toUpperCase():"?"}</div>
            }
            <div style={{position:"absolute",bottom:2,right:0,width:22,height:22,borderRadius:"50%",background:isLoggedIn?"#E8483C":"#7A6860",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,boxShadow:"0 2px 8px rgba(0,0,0,.5)",border:"2px solid #0A0806"}}>{isLoggedIn?"📷":"🔒"}</div>
          </div>
          <input id="avatar-input" type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarUpload}/>
          {avatarAnim&&<div style={{position:"absolute",top:-20,fontSize:11,fontWeight:700,color:"#6DD16D",whiteSpace:"nowrap"}}>✅ Photo mise à jour !</div>}
          <div className="profil-name">{firstName||"Anonyme"}</div>
          <div className="profil-plan">{DEV_MODE?"🛠 Mode Dev — crédits ∞":`Plan Gratuit · ${credits} crédit${credits!==1?"s":""}`}</div>
        </div>
        <div className="profil-stats">
          <div className="pstat"><div className="pstat-num">{history.length}</div><div className="pstat-lbl">Analyses</div></div>
          <div className="pstat"><div className="pstat-num">{avgScore!==null?avgScore:"—"}</div><div className="pstat-lbl">Moy. intérêt</div></div>
          <div className="pstat"><div className="pstat-num">{DEV_MODE?"∞":credits}</div><div className="pstat-lbl">Crédits</div></div>
        </div>
        {/* ── Rizz Level + Analytics ── */}
        {(()=>{
          // ── 10 niveaux ──
          const RIZZ_LEVELS=[
            {lvl:1,  min:0,  emoji:"🌱", title:"Novice du Swipe",     color:"#7A6860"},
            {lvl:2,  min:3,  emoji:"💬", title:"Apprenti Séducteur", color:"#88AACC"},
            {lvl:3,  min:6,  emoji:"✨",     title:"Charmeur Timide",      color:"#A0C4FF"},
            {lvl:4,  min:10, emoji:"🔥", title:"Plébiscite",         color:"#FFC629"},
            {lvl:5,  min:15, emoji:"🎯", title:"Tacticien du Game",    color:"#FFA040"},
            {lvl:6,  min:22, emoji:"😎", title:"Smooth Operator",      color:"#FF8C42"},
            {lvl:7,  min:30, emoji:"🧠", title:"Mind Reader",          color:"#FF6B6B"},
            {lvl:8,  min:40, emoji:"👑", title:"King of the DMs",      color:"#E8483C"},
            {lvl:9,  min:55, emoji:"🌟", title:"Légende du Dating",  color:"#FFD700"},
            {lvl:10, min:70, emoji:"👑", title:"Rizz Master",          color:"#FF7A6E"},
          ];
          const n = history.length;
          const curLvlObj = [...RIZZ_LEVELS].reverse().find(l=>n>=l.min)||RIZZ_LEVELS[0];
          const nextLvlObj = RIZZ_LEVELS[Math.min(curLvlObj.lvl, RIZZ_LEVELS.length-1)];
          const progressToNext = curLvlObj.lvl===10 ? 100 : Math.round(((n-curLvlObj.min)/(nextLvlObj.min-curLvlObj.min))*100);
          // ── Rizz Score moyen ──
          const avg = n>0 ? history.reduce((a,h)=>a+h.score,0)/n : 0;
          const rizzPct = Math.min(100,Math.round(avg*10));
          const rizzColor = rizzPct>=80?"#6DD16D":rizzPct>=60?"#FFD700":rizzPct>=40?"#FFA040":"#FF7A6E";
          // ── Analytics ──
          const highScores = history.filter(h=>h.score>=7).length;
          const replyRate = n>0?Math.min(99,Math.round((highScores/n)*100+Math.random()*15)):0;
          const datesEst = Math.floor(highScores*0.6);
          return(
            <>
              {/* Niveau Rizz */}
              <div style={{background:"rgba(255,255,255,.03)",border:`2px solid ${curLvlObj.color}30`,borderRadius:16,padding:"16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#7A6860",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>Niveau Rizz</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:26}}>{curLvlObj.emoji}</span>
                      <div>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:curLvlObj.color,lineHeight:1}}>{curLvlObj.title}</div>
                        <div style={{fontSize:11,color:"rgba(242,232,224,.4)",marginTop:2}}>Niveau {curLvlObj.lvl} / 10</div>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:900,color:curLvlObj.color,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:10,color:"#7A6860"}}>analyse{n!==1?"s":""}</div>
                  </div>
                </div>
                {/* Progress bar vers niveau suivant */}
                {curLvlObj.lvl<10&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:10,color:"rgba(242,232,224,.35)"}}>Prochain niveau : {nextLvlObj.emoji} {nextLvlObj.title}</span>
                      <span style={{fontSize:10,color:curLvlObj.color,fontWeight:700}}>{progressToNext}%</span>
                    </div>
                    <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${progressToNext}%`,background:`linear-gradient(90deg,${curLvlObj.color},${nextLvlObj.color})`,borderRadius:2,transition:"width .6s ease"}}/>
                    </div>
                    <div style={{fontSize:10,color:"rgba(242,232,224,.25)",marginTop:4}}>{nextLvlObj.min-n} analyse{nextLvlObj.min-n>1?"s":""} pour débloquer</div>
                  </div>
                )}
                {curLvlObj.lvl===10&&(
                  <div style={{textAlign:"center",fontSize:12,color:curLvlObj.color,fontWeight:700,marginTop:4}}>
                    👑 Niveau maximum atteint. Tu es une légende.
                  </div>
                )}
              </div>
              {/* Rizz Score moyen */}
              {n>0&&<div style={{background:"rgba(255,255,255,.03)",border:`1px solid ${rizzColor}30`,borderRadius:14,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:14}}>🔥</span>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#7A6860",textTransform:"uppercase",letterSpacing:"1px"}}>Rizz Score moyen</span>
                  </div>
                  <span style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:rizzColor}}>{rizzPct}<span style={{fontSize:11,opacity:.6}}>%</span></span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${rizzPct}%`,background:rizzColor,borderRadius:2}}/>
                </div>
              </div>}
              {/* Analytics */}
              {n>0&&<div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#7A6860",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>📊 Analytics perso</div>
                {isLoggedIn
                  ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {ico:"💬",val:`${replyRate}%`,lbl:"Taux de réponse", badge: replyRate>=70?"🔥 Top":replyRate>=45?"👍 Bien":"📈 Bas"},
                        {ico:"💋",val:String(datesEst),lbl:"Dates estimés",   badge: datesEst>=5?"🔥 Top":datesEst>=2?"👍 Bien":"📈 Bas"},
                        {ico:"⭐",val:String(avg.toFixed(1)),lbl:"Score moyen",badge: avg>=7?"🔥 Top":avg>=5?"👍 Bien":"📈 Bas"},
                      ].map(({ico,val,lbl,badge})=>{
                        const badgeColor = badge.startsWith("🔥")?"#E8483C":badge.startsWith("👍")?"#6DD16D":"#7A6860";
                        return(
                          <div key={lbl} style={{background:"rgba(255,255,255,.03)",borderRadius:10,padding:"10px 8px",textAlign:"center",position:"relative"}}>
                            <div style={{position:"absolute",top:6,right:6,fontSize:9,fontWeight:700,color:badgeColor,fontFamily:"'DM Sans',sans-serif",background:`${badgeColor}18`,padding:"2px 5px",borderRadius:4,lineHeight:1.2}}>{badge}</div>
                            <div style={{fontSize:18,marginBottom:4}}>{ico}</div>
                            <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#F2E8E0",lineHeight:1}}>{val}</div>
                            <div style={{fontSize:10,color:"#7A6860",marginTop:3,lineHeight:1.3}}>{lbl}</div>
                          </div>
                        );
                      })}
                    </div>
                  : <div style={{position:"relative",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,cursor:"pointer"}} onClick={onShowAuth}>
                      {["💬","💋","⭐"].map(ico=>(
                        <div key={ico} style={{background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 8px",textAlign:"center",filter:"blur(3px)",userSelect:"none"}}>
                          <div style={{fontSize:18,marginBottom:4}}>{ico}</div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#F2E8E0",lineHeight:1}}>—</div>
                          <div style={{fontSize:10,color:"#7A6860",marginTop:3}}>—</div>
                        </div>
                      ))}
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                        <span style={{fontSize:22}}>🔒</span>
                        <span style={{fontSize:11,color:"#F2E8E0",fontWeight:600,textAlign:"center"}}>Disponible avec un compte</span>
                      </div>
                    </div>
                }
              </div>}
            </>
          );
        })()}
        {/* ── Compte ── */}
        <div className="profil-section">
          {isLoggedIn
            ? <>
                <div className="profil-row">
                  <span className="profil-row-ico">✉️</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#F2E8E0"}}>Compte connecté</div>
                    <div style={{fontSize:11,color:"#7A6860",marginTop:1}}>{userEmail}</div>
                  </div>
                  <span style={{fontSize:11,background:"rgba(109,209,109,.12)",color:"#6DD16D",padding:"3px 8px",borderRadius:20,fontWeight:700}}>✓ Actif</span>
                </div>
                <div className="profil-row" onClick={onLogout}>
                  <span className="profil-row-ico">🚪</span>
                  <span className="profil-row-label" style={{color:"#FF7A6E"}}>Se déconnecter</span>
                </div>
              </>
            : <div className="profil-row" onClick={onShowAuth}>
                <span className="profil-row-ico">👤</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#F2E8E0"}}>Créer un compte</div>
                  <div style={{fontSize:11,color:"#7A6860",marginTop:1}}>Sauvegarde ton historique sur tous tes appareils</div>
                </div>
                <span className="profil-row-arrow">›</span>
              </div>
          }
        </div>
        {/* ── Referral Card ── */}
        {isLoggedIn&&<ReferralCard setCredits={setCredits} userEmail={userEmail}/>}
        <div className="profil-section">
          <div className="profil-row" onClick={()=>setModal("goal")}><span className="profil-row-ico">🎯</span><span className="profil-row-label">Objectif principal</span><span className="profil-row-val">{goalLabel[goal]}</span><span className="profil-row-arrow">›</span></div>
          <div className="profil-row" onClick={isLoggedIn?()=>setModal("app"):onShowAuth}>
            <span className="profil-row-ico">📱</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#F2E8E0"}}>App principale</div>{!isLoggedIn&&<div style={{fontSize:11,color:"#7A6860",marginTop:1}}>Créer un compte pour modifier</div>}</div>
            {isLoggedIn?<><span className="profil-row-val">{appLabel[app]}</span><span className="profil-row-arrow">›</span></>:<span style={{fontSize:14}}>🔒</span>}
          </div>
          <div className="profil-row" onClick={isLoggedIn?()=>setModal("level"):onShowAuth}>
            <span className="profil-row-ico">🌱</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#F2E8E0"}}>Niveau</div>{!isLoggedIn&&<div style={{fontSize:11,color:"#7A6860",marginTop:1}}>Créer un compte pour modifier</div>}</div>
            {isLoggedIn?<><span className="profil-row-val">{levelLabel[level]}</span><span className="profil-row-arrow">›</span></>:<span style={{fontSize:14}}>🔒</span>}
          </div>
        </div>
        <div className="profil-section">
          <div className="profil-row" onClick={()=>setShowNotifCenter(true)}>
            <span className="profil-row-ico">🔔</span>
            <span className="profil-row-label">Notifications</span>
            <span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:notifPrefs.enabled?"#6DD16D":"#7A6860",fontWeight:600}}>{notifPrefs.enabled?"Activées":"Désactivées"}</span>
              <span className="profil-row-arrow">›</span>
            </span>
          </div>
          <div className="profil-row" onClick={()=>setPrivacy(true)}><span className="profil-row-ico">🔒</span><span className="profil-row-label">Confidentialité</span><span className="profil-row-arrow">›</span></div>
          <div className="profil-row" onClick={()=>setModal("rating")}><span className="profil-row-ico">⭐</span><span className="profil-row-label">Noter l'app</span><span className="profil-row-arrow">›</span></div>
        </div>
      </div>
      {showNotifCenter&&<NotifCenter notifPrefs={notifPrefs} savePrefs={savePrefs} setShowNotifCenter={setShowNotifCenter} onToggleMain={toggleMain}/>}
      {modal==="goal"&&<ModalSelect title="Objectif principal" value={goal} options={GOALS} onSave={v=>setGoal(v)} onClose={()=>setModal(null)}/>}
      {modal==="app"&&<ModalSelect title="App principale" value={app} options={APPS_LIST.map(a=>({id:a.label,icon:a.icon,label:a.label,sub:a.sub}))} onSave={v=>setApp(v)} onClose={()=>setModal(null)}/>}
      {modal==="level"&&<ModalSelect title="Ton niveau" value={level} options={XP} onSave={v=>setLevel(v)} onClose={()=>setModal(null)}/>}
      {modal==="rating"&&<ModalRating onClose={()=>setModal(null)}/>}
    </>
  );
}

function TabPremium({ userEmail, supaUserId }) {
  const [annual,setAnnual]=useState(false);const [showWait,setShowWait]=useState(false);
  return(
    <>
      <div className="tab-premium">
        <div className="prem-hero">
          <span className="prem-crown">👑</span>
          <div className="prem-title">Passe à <em>Premium</em></div>
          <div className="prem-sub">Augmente tes chances d'obtenir un date.</div>
          <div className="prem-toggle">
            <button className={`prem-toggle-btn${!annual?" active":""}`} onClick={()=>setAnnual(false)}>Mensuel</button>
            <button className={`prem-toggle-btn${annual?" active":""}`} onClick={()=>setAnnual(true)}>Annuel <span className="prem-save">-36%</span></button>
          </div>
          <div className="prem-price">
            {annual&&<div style={{marginBottom:10}}><span style={{background:"linear-gradient(135deg,#E8483C,#FF7A6E)",color:"#fff",fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:100,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 12px rgba(232,72,60,.35)"}}>🔥 Le plus populaire</span></div>}
            <span className="prem-amount">{annual?"5,75":"9"}€</span><span className="prem-period">{annual?"/mois (69€/an)":"/mois"}</span>
          </div>
          <div className="prem-features">
            {[{ico:"⚡",txt:"Analyses illimitées"},{ico:"📸",txt:"Upload multi-screenshots"},{ico:"🎯",txt:"Suggestions ultra-personnalisées"},{ico:"📊",txt:"Score conversationnel détaillé"},{ico:"📋",txt:"Historique illimité"},{ico:"🚀",txt:"Nouvelles fonctionnalités en avant-première"}].map((f,i)=>(
              <div key={i} className="prem-feat"><div className="prem-feat-ico">{f.ico}</div><span style={{flex:1}}>{f.txt}</span><span className="prem-feat-check">✓</span></div>
            ))}
          </div>
          <button className="prem-cta" onClick={async()=>{
  const res = await fetch("https://getrizz-app-production.up.railway.app/api/create-checkout", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
   body: JSON.stringify({userId: supaUserId, email: userEmail, plan: annual?"annual":"monthly"})
  });
  const data = await res.json();
  if(data.url) window.location.href = data.url;
}}>🔥 Essayer Premium gratuitement</button>
          <div style={{fontSize:12,color:"#6DD16D",textAlign:"center",marginTop:8,fontWeight:600}}>✓ Aucun paiement aujourd'hui</div>
          <div className="prem-legal">7 jours gratuits · Annulable à tout moment · Sans engagement</div>
        </div>
      </div>
      {showWait&&<ModalWaitlist annual={annual} onClose={()=>setShowWait(false)}/>}
    </>
  );
}


// ══════════════════════════════════════════════════════════════
// SUPABASE AUTH — Phase 1
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://npwkuvgepmoxrzkpyxxf.supabase.co";
const SUPABASE_KEY = "sb_publishable_drvVOFLJthmQbeHpdeeSAw_x4Sj5AdY";
const APP_URL      = "http://localhost:3000";

// Safe localStorage wrapper
const ls = {
  get: (k) => { try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set: (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} },
  del: (k) => { try{ localStorage.removeItem(k); }catch(e){} },
};

// ── Supabase REST helpers ──
const sbFetch = (path, opts={}, token=null) => fetch(`${SUPABASE_URL}${path}`, {
  ...opts,
  headers: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${token||SUPABASE_KEY}`,
    ...(opts.headers||{})
  }
}).then(r => r.json());

const sbSignUp = (email, password, name) => sbFetch("/auth/v1/signup", {
  method: "POST",
  body: JSON.stringify({ email, password, data: { name } })
});

const sbSignIn = (email, password) => sbFetch("/auth/v1/token?grant_type=password", {
  method: "POST",
  body: JSON.stringify({ email, password })
});

const sbSignOut = (token) => sbFetch("/auth/v1/logout", {
  method: "POST"
}, token);

// Récupère la session persistée depuis localStorage Supabase
const sbGetSession = () => {
  try {
    // Supabase stocke la session sous une clé préfixée
    const keys = Object.keys(localStorage).filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if(!keys.length) return null;
    const raw = localStorage.getItem(keys[0]);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    // Vérifier expiration
    if(parsed.expires_at && parsed.expires_at < Date.now()/1000) return null;
    return parsed;
  } catch(e) { return null; }
};

// Google OAuth — vrai redirect Supabase
const sbGoogleOAuth = () => {
  const redirectTo = encodeURIComponent(window.location.origin);
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
};

function LandingPage({ onStart, onSkip }) {
  return (
    <div style={{minHeight:"100vh",background:"#0A0806",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"#FF7A6E"}}>Get'<span style={{color:"#F2E8E0"}}>Rizz</span></div>
        <button onClick={onStart} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:20,padding:"6px 16px",color:"#F2E8E0",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Connexion</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16}}>🔥</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:900,color:"#F2E8E0",lineHeight:1.1,marginBottom:12}}>L'IA qui écrit<br/>tes réponses<br/><span style={{color:"#FF7A6E",fontStyle:"italic"}}>dating</span></div>
        <div style={{fontSize:15,color:"#7A6860",lineHeight:1.7,marginBottom:32,maxWidth:320}}>Upload un screenshot de ta conversation. Reçois 3 réponses parfaites en 30 secondes.</div>
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:340,marginBottom:40}}>
          {[{ico:"📊",txt:"Score d'intérêt + Rizz Score"},{ico:"💬",txt:"3 réponses personnalisées : Chill, Bold, Cut"},{ico:"🎯",txt:"Probabilité d'obtenir un date"},{ico:"🔥",txt:"Tinder, Bumble, Hinge, Instagram..."}].map(({ico,txt})=>(
            <div key={txt} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 16px",textAlign:"left"}}>
              <span style={{fontSize:20,flexShrink:0}}>{ico}</span>
              <span style={{fontSize:13,color:"rgba(242,232,224,.8)",fontWeight:500}}>{txt}</span>
            </div>
          ))}
        </div>
        <button onClick={onStart} style={{width:"100%",maxWidth:340,padding:"18px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:16,color:"#fff",fontSize:17,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 30px rgba(232,72,60,.35)",marginBottom:14}}>🚀 Essayer gratuitement</button>
        <div style={{fontSize:12,color:"#4A3830",marginBottom:8}}>3 analyses offertes · Sans carte bancaire</div>
        <button onClick={onSkip} style={{background:"transparent",border:"none",color:"#4A3830",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>Continuer sans compte →</button>
      </div>
      <div style={{padding:"16px 24px 32px",textAlign:"center"}}>
        <div style={{fontSize:12,color:"#4A3830",fontFamily:"'Space Mono',monospace"}}>+1200 analyses générées aujourd'hui 🔥</div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ onDone }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const isValid = pass.length >= 6 && pass === confirm;

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      setDone(true);
      setTimeout(()=>onDone(), 2000);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:"#0A0806",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:360,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:"28px 24px"}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"#FF7A6E",marginBottom:6,textAlign:"center"}}>Nouveau mot de passe</div>
        {done
          ? <div style={{background:"rgba(109,209,109,.08)",border:"1px solid rgba(109,209,109,.3)",borderRadius:10,padding:"14px",fontSize:13,color:"#6DD16D",textAlign:"center"}}>✅ Mot de passe mis à jour !</div>
          : <>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16,marginTop:20}}>
                <input type="password" placeholder="Nouveau mot de passe" value={pass} onChange={e=>setPass(e.target.value)}
                  style={{width:"100%",background:"rgba(255,255,255,.04)",border:`2px solid ${pass.length>=6?"rgba(109,209,109,.35)":"rgba(255,255,255,.08)"}`,borderRadius:12,padding:"13px 16px",color:"#F2E8E0",fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none"}}/>
                <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  style={{width:"100%",background:"rgba(255,255,255,.04)",border:`2px solid ${confirm.length>=6&&confirm===pass?"rgba(109,209,109,.35)":"rgba(255,255,255,.08)"}`,borderRadius:12,padding:"13px 16px",color:"#F2E8E0",fontFamily:"'DM Sans',sans-serif",fontSize:15,outline:"none"}}/>
              </div>
              {error&&<div style={{background:"rgba(232,72,60,.1)",border:"1px solid rgba(232,72,60,.3)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#FF7A6E",marginBottom:12}}>⚠️ {error}</div>}
              <button onClick={handleReset} disabled={!isValid||loading}
                style={{width:"100%",padding:"14px",background:isValid&&!loading?"linear-gradient(135deg,#E8483C,#FF7A6E)":"rgba(255,255,255,.05)",border:"none",borderRadius:12,color:isValid&&!loading?"#fff":"#7A6860",fontSize:15,fontWeight:700,cursor:isValid&&!loading?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif"}}>
                {loading?"Mise à jour…":"🔒 Mettre à jour"}
              </button>
            </>
        }
      </div>
    </div>
  );
}
function AuthModal({ onAuth, onSkip, isModal=false }) {
  const [mode,setMode]     = useState("login");
  const [email,setEmail]   = useState("");
  const [pass,setPass]     = useState("");
  const [name,setName]     = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError]   = useState(null);
  const [sent,setSent]     = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPass  = pass.length >= 6;

  const handleGoogleAuth = () => {
    // Vrai redirect OAuth Supabase — reviendra sur APP_URL/auth/callback
    sbGoogleOAuth();
  };

  const handleSubmit = async () => {
    if(loading) return;
    setError(null);
    setLoading(true);
    try {
      if(mode==="signup") {
        const res = await sbSignUp(email, pass, name||email.split("@")[0]);
        if(res.error) throw new Error(res.error.message);
        if(res.access_token) {
          const fn = name || email.split("@")[0];
          onAuth({ email, firstName: fn, userId: res.user?.id, token: res.access_token });
        } else {
          setSent(true);
        }
      } else {
        const res = await sbSignIn(email, pass);
        if(res.error) throw new Error(res.error.message);
        const firstName = res.user?.user_metadata?.name || email.split("@")[0];
        onAuth({ email, firstName, userId: res.user?.id, token: res.access_token });
      }
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (valid) => ({
    width:"100%", background:"rgba(255,255,255,.04)",
    border:`2px solid ${valid?"rgba(109,209,109,.35)":"rgba(255,255,255,.08)"}`,
    borderRadius:12, padding:"13px 16px", color:"#F2E8E0",
    fontFamily:"'DM Sans',sans-serif", fontSize:15, outline:"none",
    boxSizing:"border-box", transition:"border-color .2s"
  });

  return (
    <div style={{background:"#0A0806",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'DM Sans',sans-serif"}}>
      {!isModal&&<><div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:900,color:"#FF7A6E",marginBottom:6}}>Get'<span style={{color:"#F2E8E0"}}>Rizz</span></div>
      <div style={{fontSize:12,color:"#7A6860",marginBottom:32,fontFamily:"'Space Mono',monospace"}}>BOOST TES CONVOS DATING</div></>}

      <div style={{width:"100%",maxWidth:360,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20,padding:"28px 24px"}}>
        {/* Tabs */}
        <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderRadius:10,padding:3,marginBottom:24}}>
          {[["login","Connexion"],["signup","Inscription"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setError(null);}} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,transition:"all .2s",background:mode===m?"#E8483C":"transparent",color:mode===m?"#fff":"#7A6860"}}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogleAuth} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,color:"#F2E8E0",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
          <span style={{fontSize:18}}>G</span> Continuer avec Google
        </button>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
          <span style={{fontSize:11,color:"#7A6860",fontFamily:"'Space Mono',monospace"}}>ou</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
        </div>

        {/* Fields */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {mode==="signup"&&(
            <input placeholder="Ton prénom" value={name} onChange={e=>setName(e.target.value)}
              style={inputStyle(name.length>0)}/>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            style={inputStyle(isValidEmail)}/>
          <input type="password" placeholder={mode==="signup"?"Mot de passe (6 car. min)":"Mot de passe"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            style={inputStyle(isValidPass)}/>
        </div>

        {/* Email confirmation sent */}
        {sent&&<div style={{background:"rgba(109,209,109,.08)",border:"1px solid rgba(109,209,109,.3)",borderRadius:10,padding:"14px",fontSize:13,color:"#6DD16D",marginBottom:12,textAlign:"center",lineHeight:1.6}}>
          📧 <strong>Vérifie ton email !</strong><br/>Un lien de confirmation t'a été envoyé.
        </div>}

        {/* Error */}
        {error&&<div style={{background:"rgba(232,72,60,.1)",border:"1px solid rgba(232,72,60,.3)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#FF7A6E",marginBottom:12,lineHeight:1.5}}>⚠️ {error}</div>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!isValidEmail||!isValidPass||loading}
          style={{width:"100%",padding:"14px",background:isValidEmail&&isValidPass&&!loading?"linear-gradient(135deg,#E8483C,#FF7A6E)":"rgba(255,255,255,.05)",border:"none",borderRadius:12,color:isValidEmail&&isValidPass&&!loading?"#fff":"#7A6860",fontSize:15,fontWeight:700,cursor:isValidEmail&&isValidPass&&!loading?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading
            ?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"tspin .7s linear infinite",display:"inline-block"}}/>Chargement…</>
            :mode==="signup"?"🚀 Créer mon compte":"🔥 Se connecter"
          }
        </button>

        {/* Forgot password */}
        {mode==="login"&&<div style={{textAlign:"center",marginTop:12}}>
          <span onClick={()=>{setMode("forgot");setError(null);setSent(false);}} style={{fontSize:12,color:"#7A6860",cursor:"pointer",textDecoration:"underline"}}>Mot de passe oublié ?</span>
        </div>}
        {mode==="forgot"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {!sent?<><input type="email" placeholder="Ton email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle(isValidEmail)}/>
          <button onClick={async()=>{setLoading(true);await sbFetch("/auth/v1/recover",{method:"POST",body:JSON.stringify({email})});setLoading(false);setSent(true);}} disabled={!isValidEmail||loading} style={{width:"100%",padding:"14px",background:isValidEmail&&!loading?"linear-gradient(135deg,#E8483C,#FF7A6E)":"rgba(255,255,255,.05)",border:"none",borderRadius:12,color:isValidEmail&&!loading?"#fff":"#7A6860",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {loading?"Envoi…":"📧 Envoyer le lien"}
          </button></>
          :<div style={{background:"rgba(109,209,109,.08)",border:"1px solid rgba(109,209,109,.3)",borderRadius:10,padding:"14px",fontSize:13,color:"#6DD16D",textAlign:"center"}}>📧 <strong>Vérifie ton email !</strong><br/>Un lien de réinitialisation t'a été envoyé.</div>}
          <span onClick={()=>{setMode("login");setError(null);}} style={{fontSize:12,color:"#7A6860",cursor:"pointer",textDecoration:"underline",textAlign:"center"}}>← Retour à la connexion</span>
        </div>}

        {/* Bonus inscription */}
        {mode==="signup"&&<div style={{marginTop:14,background:"rgba(109,209,109,.06)",border:"1px solid rgba(109,209,109,.15)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <span style={{fontSize:12,color:"#6DD16D"}}>🎁 3 analyses offertes à l'inscription</span>
        </div>}
      </div>

      {/* Skip */}
      <button onClick={onSkip} style={{marginTop:20,background:"none",border:"none",color:"#4A3830",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>
        Continuer sans compte →
      </button>

      {DEV_MODE&&<div style={{marginTop:12,background:"rgba(109,209,109,.1)",border:"1px solid rgba(109,209,109,.3)",color:"#6DD16D",fontSize:11,fontFamily:"'Space Mono',monospace",padding:"5px 14px",borderRadius:6}}>🛠 Mode développeur</div>}
    </div>
  );
}

export default function App() {
  useEffect(()=>{
    if(document.getElementById("gr-css"))return;
    const s=document.createElement("style");s.id="gr-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  // ── Auth state ──
  const [authStep,setAuthStep]=useState("loading"); // loading | auth | app
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [firstName,setFirstName]=useState("");
  const [userEmail,setUserEmail]=useState("");
  const [supaUserId,setSupaUserId]=useState(null);
  const [tab,setTab]=useState("analyse");

  // ── Restore Supabase session on mount ──
  useEffect(()=>{
  // Lire le token depuis le hash URL (retour OAuth Google)
  const hash = window.location.hash;
  if(hash && hash.includes('access_token') || hash.includes('type=recovery')) {
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if(access_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ data }) => {
          if(data?.user) {
            const u = data.user;
            const fn = u.user_metadata?.name || u.email?.split("@")[0] || "toi";
            setFirstName(fn);
            setUserEmail(u.email||"");
            setSupaUserId(u.id||null);
            setIsLoggedIn(true);
            setAuthStep("app");
            window.history.replaceState({}, document.title, window.location.pathname);
          const params2 = new URLSearchParams(hash.substring(1));
if(params2.get('type')==='recovery') { setAuthStep("reset"); return; }
          if(params2.get('type')==='signup') { setAuthStep("confirmed"); return; }          }
        });
      return;
    }
  }
  // Session normale
  const session = sbGetSession();
  if(session?.user) {
    const u = session.user;
    const fn = u.user_metadata?.name || u.email?.split("@")[0] || "toi";
    setFirstName(fn);
    setUserEmail(u.email||"");
    setSupaUserId(u.id||null);
    setIsLoggedIn(true);
    // Charger les crédits depuis Supabase
    if(u.id) {
      supabase.from('profiles').select('credits, is_premium').eq('user_id', u.id).single()
        .then(({data}) => { if(data) {
        setCredits(data.is_premium ? 999 : data.credits);
        setIsPremium(data.is_premium || false);
      } else setCredits(3); });
    }
    setAuthStep("app");
  } else {
    const guestActive = ls.get("gr_guest_active");
    if(guestActive) setAuthStep("app");
    else setAuthStep("landing");
  }
},[]);
  // ── Per-user storage prefix (unique guest session vs account) ──
  const getUserPrefix = (email) => email ? "gr_"+email.replace(/[^a-z0-9]/gi,"_") : null;
  const [userPrefix,setUserPrefix]=useState(()=>{
    const raw=ls.get("gr_user"); const u=raw?JSON.parse(raw):null;
    if(u?.email) return getUserPrefix(u.email);
    const gid=ls.get("gr_guest_id"); return gid ? "gr_"+gid : null;
  });

  const [credits,setCredits]=useState(()=>{
    if(DEV_MODE) return 999;
    const raw=ls.get("gr_user"); const u=raw?JSON.parse(raw):null;
    if(!u?.email) return 3; // invité : toujours 3 par défaut
    const pfx=getUserPrefix(u.email);
    const c=ls.get(pfx+"_credits"); return c!==null?parseInt(c):3;
  });
  const [isPremium,setIsPremium]=useState(()=>{
    try{ const raw=ls.get("gr_user"); const u=raw?JSON.parse(raw):null; return u?.premium||false; }catch(e){ return false; }
  });
  const [history,setHistory]=useState(()=>{
    const raw=ls.get("gr_user"); const u=raw?JSON.parse(raw):null;
    if(!u?.email) return []; // invité : historique vide au démarrage
    const pfx=getUserPrefix(u.email);
    const h=ls.get(pfx+"_history");
    if(!h) return [];
    try{ return JSON.parse(h).map(item=>({...item, ts: new Date(item.ts)})); }catch(e){ return []; }
  });
  const [replayData,setReplayData]=useState(null);
  const [showAuthModal,setShowAuthModal]=useState(false);

  // ── Persist to localStorage (per-user keys) ──
  useEffect(()=>{ if(firstName) ls.set("gr_firstname", firstName); },[firstName]);
  useEffect(()=>{ if(!DEV_MODE && userPrefix) ls.set(userPrefix+"_credits", String(credits)); },[credits, userPrefix]);
  useEffect(()=>{ if(userPrefix) ls.set(userPrefix+"_history", JSON.stringify(history)); },[history, userPrefix]);

  const handleAuth = async ({email, firstName:fn, userId=null, token=null}) => {
    const pfx = getUserPrefix(email);
    const savedHistory = ls.get(pfx+"_history");
    const savedCredits = ls.get(pfx+"_credits");
    setFirstName(fn);
    setUserEmail(email);
    setSupaUserId(userId);
    setUserPrefix(pfx);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    ls.del("gr_guest_active");
    setHistory(savedHistory ? JSON.parse(savedHistory).map(i=>({...i,ts:new Date(i.ts)})) : []);
    // Charger les crédits depuis Supabase
    if(userId && !DEV_MODE) {
      const { data } = await supabase.from('profiles').select('credits').eq('user_id', userId).single();
      if(data) setCredits(data.credits);
      else setCredits(3);
    } else {
      setCredits(DEV_MODE ? 999 : savedCredits ? parseInt(savedCredits) : 3);
    }
    setAuthStep("app");
  };
  const handleSkip = () => {
    const guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2,8);
    const pfx = "gr_" + guestId;
    ls.set("gr_guest_id", guestId);
    ls.set("gr_guest_active", "1");
    setIsLoggedIn(false);
    setUserEmail("");
    setSupaUserId(null);
    setUserPrefix(pfx);
    setFirstName("Invité");
    setHistory([]);
    setCredits(DEV_MODE ? 999 : 3);
    setShowAuthModal(false);
    setTab("analyse");
    setAuthStep("app");
  };
  const handleLogout = async () => {
    // Récupérer le token depuis la session Supabase
    try {
      const session = sbGetSession();
      if(session?.access_token) await sbSignOut(session.access_token);
    } catch(e) {}
    // Nettoyer la session Supabase du localStorage
    Object.keys(localStorage).filter(k=>k.startsWith("sb-")&&k.endsWith("-auth-token"))
      .forEach(k=>ls.del(k));
    ls.del("gr_guest_active");
    setIsLoggedIn(false);
    setUserEmail("");
    setSupaUserId(null);
    setFirstName("");
    setAuthStep("auth");
  };

  const NAV=[
    {id:"analyse",ico:"✨",lbl:"Analyser",badge:false},
    {id:"historique",ico:"📋",lbl:"Historique",badge:history.length>0},
    {id:"profil",ico:"👤",lbl:"Profil",badge:false},
    {id:"premium",ico:"👑",lbl:"Premium",badge:false},
  ];

  // ── Loading screen (session restore) ──
  if(authStep==="loading") return(
    <div style={{minHeight:"100vh",background:"#0A0806",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:900,color:"#FF7A6E"}}>Get'<span style={{color:"#F2E8E0"}}>Rizz</span></div>
      <span style={{width:24,height:24,border:"3px solid rgba(255,255,255,.15)",borderTopColor:"#FF7A6E",borderRadius:"50%",animation:"tspin .7s linear infinite",display:"inline-block"}}/>
    </div>
  );
  // ── Auth screen ──
if(authStep==="reset") return <ResetPasswordModal onDone={()=>setAuthStep("auth")}/>;
if(authStep==="confirmed") return(
  <div style={{minHeight:"100vh",background:"#0A0806",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:900,color:"#FF7A6E"}}>Get'<span style={{color:"#F2E8E0"}}>Rizz</span></div>
    <div style={{background:"rgba(109,209,109,.08)",border:"1px solid rgba(109,209,109,.3)",borderRadius:16,padding:"24px",textAlign:"center",maxWidth:320}}>
      <div style={{fontSize:40,marginBottom:12}}>✅</div>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#F2E8E0",marginBottom:8}}>Email confirmé !</div>
      <div style={{fontSize:13,color:"#7A6860",marginBottom:20}}>Ton compte est activé. Tu peux maintenant te connecter.</div>
      <button onClick={()=>setAuthStep("auth")} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#E8483C,#FF7A6E)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🔥 Se connecter</button>
    </div>
  </div>
);if(authStep==="landing") return <LandingPage onStart={()=>setAuthStep("auth")} onSkip={handleSkip}/>;
if(authStep==="auth") return <AuthModal onAuth={handleAuth} onSkip={handleSkip}/>;
  return(
    <div className="app">
      <div className="app-top">
        <div className="app-logo">Get'<span>Rizz</span></div>
        <div className="app-top-right">
          {DEV_MODE
            ? <div className="app-pill-dev">🛠 DEV</div>
            : isPremium
              ? <div className="app-pill" style={{background:"rgba(232,72,60,.15)",borderColor:"rgba(232,72,60,.5)",color:"#FF7A6E"}}>⚡ illimité</div>
              : <div className="app-pill" style={credits<=0?{background:"rgba(232,72,60,.15)",borderColor:"rgba(232,72,60,.4)",color:"#FF7A6E"}:{}}>{credits>0?`⚡ ${credits} crédit${credits>1?"s":""}`:"Upgrade 👑"}</div>
          }
          {isLoggedIn
            ? <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div className="app-ava" title={userEmail} style={{cursor:"pointer"}} onClick={()=>setTab("profil")}>{firstName?firstName[0].toUpperCase():"?"}</div>
              </div>
            : <button onClick={()=>setShowAuthModal(true)} style={{background:"rgba(232,72,60,.15)",border:"1px solid rgba(232,72,60,.3)",borderRadius:20,padding:"5px 12px",color:"#FF7A6E",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Connexion</button>
          }
        </div>
      </div>
      {/* Auth modal optionnelle */}
      {showAuthModal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowAuthModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:380,background:"#0A0806",borderRadius:20,overflow:"hidden"}}>
            <AuthModal onAuth={handleAuth} onSkip={()=>setShowAuthModal(false)} isModal={true}/>
          </div>
        </div>
      )}
      <div className="app-content">
        {tab==="analyse"&&<TabAnalyse firstName={firstName} credits={credits} setCredits={setCredits} history={history} setHistory={setHistory} replayData={replayData} setReplayData={setReplayData} isLoggedIn={isLoggedIn} isPremium={isPremium} onShowAuth={()=>setShowAuthModal(true)} userEmail={userEmail} supaUserId={supaUserId}/>}
        {tab==="historique"&&<TabHistorique history={history} onReplay={h=>{setReplayData({app:h.app,goal:h.goal});setTab("analyse");}}/>}
        {tab==="profil"&&<TabProfil firstName={firstName} credits={credits} setCredits={setCredits} history={history} isLoggedIn={isLoggedIn} userEmail={userEmail} onShowAuth={()=>setShowAuthModal(true)} onLogout={handleLogout}/>}
        {tab==="premium"&&<TabPremium userEmail={userEmail} supaUserId={supaUserId}/>}
      </div>
      <div className="app-nav">
        {NAV.map(n=>(
          <button key={n.id} className={`app-nav-btn${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
            {n.badge&&<span className="app-nav-badge"/>}
            <span className="app-nav-ico">{n.ico}</span>
            <span className="app-nav-lbl">{n.lbl}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
const groups = [
{id:"pasta",label:"THE MAIN EVENT",title:"Pasta, with passion.",intro:"Twirl into the good stuff. There's always room for one more plate.",items:[
["Roman Carbonara","Silky parmesan, crisp pancetta and black pepper.","https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1000&q=90"],
["Penne Arrabbiata","Tomato, garlic, olive oil and a little chilli warmth.","https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=90"],
["Fettuccine Alfredo","Wide ribbons folded through velvety parmesan cream.","https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=90"],
["House Lasagna","Tender layers, slow-cooked ragù and a golden top.","https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1000&q=90"],
["Basil Pesto Fusilli","Corkscrew pasta tossed in fragrant basil pesto.","https://images.unsplash.com/photo-1555949258-eb67b1ef0e?auto=format&fit=crop&w=1000&q=90"],
["Mushroom Tagliatelle","Silky ribbons with golden mushrooms and herbs.","https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=90"],
["Tomato Basil Spaghetti","Bright tomato sauce, fresh basil and a generous twirl.","https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=90"],
["Creamy Garlic Penne","Penne in mellow garlic cream with parmesan.","https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=90"],
["Spaghetti Pomodoro","Slow-simmered tomato, basil and a little parmesan.","https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=1000&q=90"],
["Rigatoni alla Vodka","Ridged rigatoni in a silky tomato cream sauce.","https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=90"],
["Pesto Gnocchi","Pillowy gnocchi tossed with vibrant basil pesto.","https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=90"],
["Baked Maccheroni","Golden baked pasta with a bubbling cheese top.","https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1000&q=90"]]},
{id:"savoury",label:"SOMETHING SAVOURY",title:"Big bites. Good times.",intro:"Burgers, golden fries, fresh salads and all the savoury favourites.",items:[
["Cheeseburger","A juicy, satisfying classic with all the right things.","https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=90"],
["French Fries","Crisp edges, fluffy centres, made for sharing.","https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=90"],
["Macaroni & Cheese","Comforting macaroni tucked into rich, creamy cheese.","https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1000&q=90"],
["Garden Salad","Fresh greens, colour and a bright, lively finish.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=90"],
["Double Smash Burger","Two seared patties, melted cheese and a toasted bun.","https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1000&q=90"],
["Loaded Cheese Fries","Crispy fries finished with a generous cheese sauce.","https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1000&q=90"],
["Crispy Chicken Bites","Golden, crunchy bites made for dipping.","https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=90"],
["Grilled Chicken Salad","Fresh greens with savoury grilled chicken.","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=90"]]},
{id:"bakery",label:"A LITTLE SOMETHING SWEET",title:"Save room for dessert.",intro:"Fresh-from-the-oven comforts and sweet things worth slowing down for.",items:[
["Chocolate Cake","A soft, rich slice for the sweet-toothed.","https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=90"],
["Doughnuts","Little rings of happiness, finished with a sweet touch.","https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=90"],
["Golden Meat Pie","A flaky, golden pastry with a savoury centre.","https://images.unsplash.com/photo-1608198093002-ad4e005484df?auto=format&fit=crop&w=1000&q=90"],
["Soft Buns","Soft, pillowy bakery favourites for any time of day.","https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=90"],
["Strawberry Shortcake","Soft layers, fresh cream and bright strawberries.","https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=90"],
["Glazed Bakery Doughnuts","A soft centre with a glossy sweet finish.","https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=90"],
["Butter Croissants","Flaky, golden layers baked until beautifully crisp.","https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=90"],
["Cinnamon Rolls","Soft swirls with cinnamon warmth and sweet icing.","https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=90"]]}
];
const overview=[["Pasta","The star of our table.","#pasta","https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=900&q=88"],["Savoury","For the hearty appetite.","#savoury","https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88"],["Bakery & sweets","A sweet little finish.","#bakery","https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=88"]];
export function ReferenceHome(){
useEffect(()=>{
  const selector=".hero-copy, .hero-food, .plate-section .section-heading, .plate-overview-card, .food-section-heading, .food-card, .story-image, .story-copy, .newsletter-section > .eyebrow, .newsletter-section h2, .newsletter-copy, .newsletter-form";
  const targets=Array.from(document.querySelectorAll<HTMLElement>(selector));
  targets.forEach((el)=>el.setAttribute("data-reveal",""));
  if(!("IntersectionObserver" in window)){targets.forEach((el)=>el.classList.add("is-visible"));return;}
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){(entry.target as HTMLElement).classList.add("is-visible");observer.unobserve(entry.target);}
    });
  },{threshold:0.12,rootMargin:"0px 0px -45px 0px"});
  targets.forEach((el)=>observer.observe(el));
  const navLinks=Array.from(document.querySelectorAll<HTMLAnchorElement>(".site-nav a[href^='#']"));
  const sections=navLinks.map((link)=>document.querySelector<HTMLElement>(link.getAttribute("href")||"")).filter((section):section is HTMLElement=>Boolean(section));
  const navObserver=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        navLinks.forEach((link)=>{
          const active=link.getAttribute("href")==="#"+entry.target.id;
          link.classList.toggle("is-active",active);
          if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
        });
      }
    });
  },{rootMargin:"-25% 0px -60% 0px",threshold:0});
  sections.forEach((section)=>navObserver.observe(section));
  return ()=>{observer.disconnect();navObserver.disconnect();};
},[]);
const[email,setEmail]=useState("");const[msg,setMsg]=useState("");
function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!email.trim())return;setMsg("Thanks — the pitãssö mailing list is coming soon.");setEmail("");}
return <main className="reference-site" id="top">
<header className="site-header"><a className="wordmark" href="#top">pitãssö<span>®</span></a><nav className="site-nav" aria-label="Main navigation"><a href="#pasta">Pasta</a><a href="#savoury">Savoury</a><a href="#bakery">Bakery & sweets</a><a href="#story">Our story</a></nav><a className="header-cta" href="#plate">Explore food ↗</a></header>
<section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot"/> GOOD FOOD. GOOD MOOD.</p><h1>Take a taste.<br/>Come join us.</h1><p className="hero-description">Life is so endlessly delicious. Find your favourite forkful, make a little mess, and stay for one more bite.</p><a className="primary-button" href="#plate">Explore the menu ↗</a><div className="hero-footnote"><span>PASTA FIRST. ALWAYS ROOM FOR MORE.</span><span>01 / 04</span></div></div><div className="hero-food"><div className="hero-food-image"><img src="https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1600&q=92" alt="A generous plate of pasta" fetchPriority="high" decoding="async"/></div><span className="food-caption food-caption--top">FRESHLY MADE<br/>WITH APPETITE</span><span className="food-caption food-caption--bottom">THE PASTA<br/>IS CALLING</span></div><span className="floating-garnish garnish-tomato">✳</span><span className="floating-garnish garnish-leaf">✿</span><span className="floating-garnish garnish-pepper">✳</span><div className="hero-scroll">SCROLL TO GET A TASTE ↓</div></section>
<section className="plate-section" id="plate"><div className="section-heading"><p className="eyebrow"><span className="eyebrow-dot"/> A TABLE FULL OF GOOD THINGS</p><h2>What&apos;s on our <em>plate</em></h2><p className="section-subtitle">A little something for every appetite.</p></div><div className="plate-overview">{overview.map(([title,detail,href,image],i)=><a className="plate-overview-card" href={href} key={title}><div className="plate-overview-image"><img src={image} alt={title} loading="lazy"/><span>0{i+1}</span></div><h3>{title}</h3><p>{detail}</p><b>TAKE A LOOK ↗</b></a>)}</div><span className="plate-flower plate-flower--left">✳</span><span className="plate-flower plate-flower--right">✿</span></section>
<div className="food-marquee" aria-label="Pasta, good company and something sweet"><div className="food-marquee-track"><span>PASTA MADE WITH PASSION</span><i>✳</i><span>GOOD FOOD, GOOD MOOD</span><i>✿</i><span>ALWAYS ROOM FOR DESSERT</span><i>✳</i><span>PASTA MADE WITH PASSION</span><i>✳</i><span>GOOD FOOD, GOOD MOOD</span><i>✿</i><span>ALWAYS ROOM FOR DESSERT</span></div></div>
{groups.map((g,i)=><section className={"food-section food-section--"+g.id} id={g.id} key={g.id}><div className="food-section-heading"><p className="eyebrow"><span className="eyebrow-dot"/> {g.label}</p><h2>{g.title}</h2><p>{g.intro}</p></div><div className="food-gallery">{g.items.map(([name,desc,image],j)=><article className="food-card" key={name}><div className="food-card-image"><img src={image} alt={name} loading="lazy"/><span>0{j+1}</span></div><div className="food-card-copy"><p>{g.id==="pasta"?"MADE FOR THE PASTA PEOPLE":g.label}</p><h3>{name}</h3><p>{desc}</p></div></article>)}</div>{i<2&&<div className="food-divider"><span>✳</span><i/><span>✿</span></div>}</section>)}
<section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=90" alt="Creamy pasta finished with fresh herbs" loading="lazy"/><span className="story-image-note">MADE TO BE<br/>SHARED</span></div><div className="story-copy"><p className="eyebrow"><span className="eyebrow-dot"/> THE PITÃSSÖ FEELING</p><h2>Let&apos;s see<br/>what <em>good</em><br/>food can do.</h2><p className="story-quote">“The best moments have a way of happening around the table.”</p><p className="story-description">A plate passed across the table. One more forkful. A conversation that runs a little longer than planned. That&apos;s the kind of good time we make room for.</p><a className="text-link" href="#newsletter">A seat is waiting ↗</a><div className="story-markers"><span>✳</span><span>✿</span><span>✳</span></div></div></section>
<section className="newsletter-section" id="newsletter"><span className="newsletter-decor newsletter-decor--one">✿</span><span className="newsletter-decor newsletter-decor--two">✳</span><span className="newsletter-decor newsletter-decor--three">✦</span><p className="eyebrow"><span className="eyebrow-dot"/> A LITTLE NOTE FROM US</p><h2>Easy recipes will<br/>send to your inbox</h2><p className="newsletter-copy">Good food, fresh updates and a little inspiration. Straight to you.</p><form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)} required/><button type="submit">Count me in ↗</button></form><p className="newsletter-message" aria-live="polite">{msg}</p></section>
<footer className="site-footer"><div className="footer-brand"><a className="wordmark wordmark--footer" href="#top">pitãssö<span>®</span></a><p>GOOD FOOD.<br/><em>GOOD MOOD.</em></p></div><div className="footer-column"><h3>Explore</h3><a href="#pasta">Pasta</a><a href="#savoury">Savoury</a><a href="#bakery">Bakery & sweets</a></div><div className="footer-column"><h3>Find us</h3><span>Made with appetite</span><span>Made for sharing</span></div><div className="footer-column"><h3>Follow along</h3><a href="#top">Instagram ↗</a><a href="#top">TikTok ↗</a></div><div className="footer-bottom"><span>© 2026 PITÃSSÖ. ALL RIGHTS RESERVED.</span><a href="#top">BACK TO TOP ↑</a></div></footer></main>;
}

(function(r){
const ru=x=>Math.ceil(+x.toFixed(6));                       // ROUNDUP(x,0) de Excel
const rd3=x=>Math.sign(x)*Math.round(Math.abs(x)*1000)/1000; // ROUND(x,3) de Excel
function calc(i,s){
  const usd=+i.usd||0,kg=+i.kg||0,mk=+i.markup||0,fin=+i.final||0,col=+i.col||0;
  const cop=ru(usd*(1+s.tax)*s.trm);          // E = ROUNDUP(USD*(1+tax)*TRM,0)
  const ship=kg*s.rate;                        // G = kg * tarifa
  const total=ship+cop;                        // H = G + E
  const sug=total*(1+mk);                      // J = H*(1+markup)
  return {cop,ship,total,sug,sugProfit:sug-total,
    margin:fin>0?rd3((fin-total)/fin):null,    // L = ROUND((K-H)/K,3)
    profit:fin>0?fin-total:null,
    diff:(col>0&&fin>0)?col-fin:null,          // P = O-K
    price:fin>0?fin:sug};
}
const api={calc};
if(typeof module!=='undefined')module.exports=api;else r.KCalc=api;
})(this);

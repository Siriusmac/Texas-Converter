const census='https://www.census.gov/geographies/reference-files/2010/geo/state-area.html';
const nasa='https://science.nasa.gov/solar-system/planets/planet-sizes-and-locations-in-our-solar-system/';
const continents='https://jsonlint.com/datasets/continents';
const iau='https://iauarchive.eso.org/public/themes/measuring/';
const states=[['California',423967],['Alaska',1723337],['Arizona',295234],['Colorado',269601],['Florida',170312],['Hawaii',28313],['Connecticut',14357],['Delaware',6446]];
const lands=[['Asia',44579000],['Africa',30370000],['America del Nord',24709000],['America del Sud',17840000],['Antartide',14000000],['Europa',10180000],['Oceania',8525989]];
const planets=[['Mercurio',4880],['Venere',12104],['Terra',12756],['Marte',6792],['Giove',142984],['Saturno',120536],['Urano',51118],['Nettuno',49528],['Luna',3480,'https://science.nasa.gov/moon/facts/'],['Sole',1400000,'https://science.nasa.gov/sun/facts/']];
export const catalog=[
 ...states.map(([name,value])=>({name,value,mode:'area',group:'Stati USA',detail:'Area totale · terre e acque',source:census})),
 ...lands.map(([name,value])=>({name,value,mode:'area',group:'Continenti',detail:'Area geografica approssimata',source:continents})),
 ...planets.flatMap(([name,d,source=nasa])=>[{name,value:d,mode:'length',group:'Spazio',detail:name==='Luna'||name==='Sole'?'Diametro approssimato':'Diametro equatoriale',source},{name,value:Math.PI*d*d,mode:'area',group:'Spazio',detail:'Superficie sferica stimata · π × diametro²',source}]),
 ...[['Terra → Luna',384400,'Distanza media','https://science.nasa.gov/moon/facts/'],['Unità astronomica',149597870.7,'1 au · definizione esatta',iau],['Anno luce',299792.458*365.25*86400,'Anno giuliano · 365,25 giorni',iau],['Parsec',149597870.7*648000/Math.PI,'1 pc · 648.000/π au',iau],['Secondo luce',299792.458,'Distanza percorsa dalla luce in 1 s',iau]].map(([name,value,detail,source])=>({name,value,detail,source,mode:'length',group:'Spazio'}))
];

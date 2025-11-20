const pxPerMeter = 50;

export function generateLayout(spec) {
  const {width=12, height=8, beds=2, baths=1} = spec;
  const W = width * pxPerMeter;
  const H = height * pxPerMeter;

  const rooms = [];

  rooms.push({x:0, y:0, w:W, h:H*0.35, label:'Living'});
  
  const bedY = H*0.35;
  const bedH = H*0.4;
  const bedW = W / beds;

  for(let i=0; i<beds; i++){
    rooms.push({x: i*bedW, y: bedY, w: bedW, h: bedH, label:`Bedroom ${i+1}`});
  }

  rooms.push({x:0, y:H*0.75, w:W*0.25, h:H*0.25, label:'Bath'});
  rooms.push({x:W*0.7, y:H*0.75, w:W*0.3, h:H*0.25, label:'Kitchen'});

  return {W, H, rooms};
}

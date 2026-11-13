const C = {
  company: 'Meridian',
  opts: {
    fiber:    { name: 'Fiber to homes', note: 'Slow to pay back. Lasts for decades.' },
    wireless: { name: 'Wireless network and spectrum', note: 'Two chips a cycle holds your position.' },
    legacy:   { name: 'Legacy copper network', note: 'Cash today from a shrinking business.' },
    ptv:      { name: 'Buy the satellite TV company', note: 'One time deal. Adds cash for two cycles.' },
    media:    { name: 'Buy the film and TV studio', note: 'One time deal. Adds cash every cycle after.' },
    dividend: { name: 'Dividend', note: 'Shareholders expect three chips a cycle.' },
    debt:     { name: 'Pay down debt', note: 'Every six chips of debt costs one chip a cycle.' }
  },
  kpis: {
    adds:   'Postpaid net adds',
    rev:    'Revenue growth',
    margin: 'Profit margin',
    fcf:    'Free cash flow',
    churn:  'Customer churn',
    homes:  'Fiber homes passed',
    video:  'Video subscribers',
    lev:    'Debt to earnings'
  },
  strategies: {
    network: { name: 'Best network', where: 'Connectivity only.', how: 'The fastest and most reliable wireless and fiber.' },
    bundle:  { name: 'The bundle', where: 'Connectivity plus TV.', how: 'One bill for phone, internet and TV, at scale.' },
    content: { name: 'Content plus distribution', where: 'Connectivity plus owned film and TV.', how: 'Exclusive content delivered over your own network.' },
    harvest: { name: 'Cash machine', where: 'The customers you already have.', how: 'Lowest cost and the highest payout to shareholders.' }
  },
  guess: {
    q: 'Before you start. A company has six good projects and enough capital to do three of them well. What should it fund?',
    a: [['all', 'All six, each at half strength'], ['three', 'The best three, at full strength'], ['one', 'The best one, and hold the rest']]
  },
  tiles: [
    ['Wireless', '54% of revenue', 'Subscribers are growing 1% a year. A challenger just cut its prices.'],
    ['Legacy voice and copper', '22% of revenue', 'Shrinking 9% a year.'],
    ['Home internet', 'Fiber reaches 5% of homes', 'Cable sells faster speeds in 70% of your territory.'],
    ['Television', 'Small resale business', 'Thin margins. Streaming services are growing.'],
    ['Balance sheet', 'Debt is 1.8 times earnings', 'Investment grade credit rating.'],
    ['Dividend', 'Raised 30 years in a row', 'Takes 45% of free cash flow.']
  ],
  diag: {
    q: 'What is the biggest challenge on this dashboard?',
    a: [
      ['core', 'The core is flattening while legacy shrinks, so future cash is at risk.', 'The dashboard supports this reading. Wireless is growing 1% a year and legacy is shrinking 9% a year. Together they are 76% of revenue.'],
      ['debt', 'Debt is too high, so interest costs will crowd out new investment.', 'Debt is 1.8 times earnings with an investment grade rating. The dashboard does not show a debt problem today. The core growing 1% while legacy shrinks 9% is the larger number.'],
      ['div', 'The dividend is too generous, so shareholders are draining needed capital.', 'The dividend takes 45% of free cash flow and is covered today. The core growing 1% while legacy shrinks 9% is the larger number.'],
      ['brand', 'The brand is weak, so customers will keep leaving for cheaper rivals.', 'The dashboard has no brand data. It does show the core growing 1% while legacy shrinks 9%.']
    ]
  },
  news: [
    ['Years 1 and 2', 'A satellite TV company is for sale. A challenger carrier has dropped contracts and cut prices.'],
    ['Years 3 and 4', 'A film and TV studio is for sale. Streaming is growing. Cable internet is faster than your copper lines.'],
    ['Years 5 and 6', 'The government is auctioning new spectrum for 5G. Wireless chips do 25% more this cycle.'],
    ['Years 7 and 8', 'Interest rates are rising. Customers are asking for faster home internet.']
  ],
  dealRounds: { ptv: [0,1], media: [1,2] },
  transfer: 'In your own unit, what are you funding a little of that you could stop funding?',
  timeline: [
    ['2014', 'AT&T reports $132.4 billion in revenue, $82.1 billion in total debt and dividends of $1.85 a share. In May it agrees to buy DIRECTV.', ['ar14','dtvpr']],
    ['2015', 'The DIRECTV deal closes in July. AT&T put the equity value at $48.5 billion and the total at $67.1 billion with DIRECTV debt.', ['dtv8k','dtvpr']],
    ['2018', 'The Time Warner deal closes in June at $85.4 billion. AT&T reports net debt of $180.4 billion at the close.', ['twpr']],
    ['2020', 'AT&T records a $15.5 billion noncash impairment on its domestic video business in the fourth quarter.', ['q420']],
    ['2021', 'AT&T moves its US video business into a venture with TPG. The deal implies an enterprise value of $16.25 billion. AT&T keeps 70%.', ['tpg21']],
    ['2022', 'WarnerMedia is spun off and merged with Discovery in April. AT&T receives $40.4 billion in cash, and WarnerMedia keeps certain debt. The annual dividend goes from $2.08 to $1.11 a share. AT&T says it will step up investment in 5G and fiber, with a plan to reach 30 million fiber locations by the end of 2025.', ['wbd22','div22']],
    ['2024', 'AT&T agrees to sell its remaining 70% of DIRECTV to TPG and expects about $7.6 billion in cash payments.', ['tpg24']]
  ],
  sources: {
    ar14:  ['AT&T Inc., 2014 Annual Report, Exhibit 13 to Form 10-K', 'https://www.sec.gov/Archives/edgar/data/732717/000073271715000016/ex13.htm'],
    dtv8k: ['AT&T Inc., Form 8-K, DIRECTV merger closing, July 24, 2015', 'https://sec.gov/Archives/edgar/data/732717/000073271715000069/form8k.htm'],
    dtvpr: ['AT&T and DIRECTV merger announcement, May 18, 2014, as reported by Advanced Television', 'https://www.advanced-television.com/2014/05/19/att-acquires-directv-for-48-5bn/'],
    twpr:  ['AT&T Completes Acquisition of Time Warner Inc., June 2018, as reported by Telecompaper', 'https://www.telecompaper.com/news/atandt-completes-acquisition-of-time-warner--1248664'],
    q420:  ['AT&T Inc., Form 8-K, fourth quarter 2020 results, January 27, 2021', 'https://www.sec.gov/Archives/edgar/data/732717/000073271721000007/t-20210127.htm'],
    tpg21: ['AT&T and TPG to Form New Entity to Operate AT&T’s U.S. Video Unit, February 25, 2021', 'https://about.att.com/story/2021/video.html'],
    wbd22: ['Discovery and AT&T Close WarnerMedia Transaction, April 8, 2022, as reported by Telecompetitor', 'https://www.telecompetitor.com/att-and-discovery-close-warnermedia-transaction/'],
    div22: ['AT&T Inc., Form 8-K, February 1, 2022', 'https://www.sec.gov/Archives/edgar/data/732717/000119312522023926/d297230d8k.htm'],
    tpg24: ['AT&T Sells Remaining Stake in DIRECTV to TPG, September 30, 2024', 'https://about.att.com/story/2024/directv-to-tpg.html'],
    ptw:   ['A. G. Lafley and Roger L. Martin, Playing to Win: How Strategy Really Works (Harvard Business Review Press, 2013)', ''],
    porter:['Michael E. Porter, “What Is Strategy?” Harvard Business Review, November to December 1996', ''],
    kerr:  ['Steven Kerr, “On the Folly of Rewarding A, While Hoping for B,” Academy of Management Journal 18, no. 4 (1975)', '']
  }
};
function memos(a, k, strat, ctx){
  const out = []; const has = id => k.indexOf(id)>=0; const build = a.fiber + a.wireless;
  const tag = id => Model.KFIT[strat][id]===1 ? 'fits' : (Model.KFIT[strat][id]===0 ? 'conflicts' : 'neutral');
  if (has('margin')) out.push(['margin', build>0 ? 'Regional leaders hit the margin target by slowing construction crews. Your network chips built 15% less.' : 'Leaders hit the margin target by trimming legacy upkeep costs. Legacy cash rose 15%.']);
  if (has('fcf')) out.push(['fcf', build>0 ? 'Finance pushed capital projects into next year to protect free cash flow. Your network chips built 15% less.' : 'Finance protected free cash flow. There was no network build to delay.']);
  if (has('rev')) out.push(['rev', (a.ptv||a.media||ctx.ptvOwned||ctx.mediaOwned) ? 'Revenue jumped with the acquisition. Teams spent the cycle on integration and network build ran 5% slower.' : 'Sales teams chased low margin equipment revenue. Revenue grew and wireless value slipped 1%.']);
  if (has('adds')) out.push(['adds', 'Stores gave away phones to hit net adds. Subscribers rose and revenue per customer fell.']);
  if (has('churn')) out.push(['churn', 'Care teams fixed repeat problems to keep customers. Rival price cuts hurt 30% less.']);
  if (has('homes')) out.push(['homes', a.fiber>0 ? 'Crews built fiber fast, in the places where it was cheapest. Homes passed rose 10% and sign ups per home fell 7%.' : 'You measured fiber homes passed and funded no fiber. Nobody could act on this.']);
  if (has('video')) out.push(['video', (a.ptv||ctx.ptvOwned) ? 'Video teams discounted bundles to hold subscribers. Losses slowed 20% and each subscriber earned less.' : 'You measured video subscribers and you own no video business. Nobody could act on this.']);
  if (has('lev')) out.push(['lev', a.borrow>2 ? 'Treasury objected to the borrowing. You overrode them.' : 'Treasury refinanced early. Rising rates will hurt less.']);
  return out.map(m => ({ id: m[0], text: m[1], tag: tag(m[0]) }));
}
globalThis.C = C; globalThis.memos = memos;

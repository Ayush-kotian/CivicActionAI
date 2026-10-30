import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Report } from '../models/Report.js';
import { findDuplicatesInPool } from '../services/duplicate/duplicateService.js';

// Base coordinates around a central civic zone (e.g., Central District: 12.9716, 77.5946)
const HOTSPOT_CENTER = { lat: 12.9716, lon: 77.5946, address: 'Main Road / Commercial Cross' };
const NORTH_WARD = { lat: 12.9850, lon: 77.6050, address: 'North Avenue & College Gate' };
const MARKET_AREA = { lat: 12.9600, lon: 77.5800, address: 'Central Market & Bus Stand' };
const RESIDENTIAL_ZONE = { lat: 12.9780, lon: 77.5700, address: 'Green Glen Residential Park' };

const rawSeedReports = [
  // --- HOTSPOT 1: MAIN ROAD WATERLOGGING & DRAINAGE (9 reports in 400m cluster) ---
  {
    complaintId: 'CAI-1001',
    description: 'Severe waterlogging near the main road after yesterday rain. Vehicles are struggling to pass and water has begun entering nearby storefronts.',
    category: 'Waterlogging',
    summary: 'Severe road waterlogging causing vehicular gridlock and threatening commercial establishments.',
    location: { latitude: 12.9718, longitude: 77.5948, address: 'Main Road, Block A' },
    priority: 'HIGH',
    priorityScore: 78,
    priorityReasons: ['Major arterial roadway obstructed', 'High vehicular congestion', 'Risk of commercial property damage'],
    safetyRisk: false,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Drainage',
    assignedTo: 'Officer Ramesh Kumar'
  },
  {
    complaintId: 'CAI-1002',
    description: 'Storm water drain completely clogged with plastic debris and silt on Main Road right by the crossing.',
    category: 'Drainage',
    summary: 'Storm drain obstruction with plastic silt near Main Road intersection.',
    location: { latitude: 12.9715, longitude: 77.5945, address: 'Main Road Crossing, South Side' },
    priority: 'HIGH',
    priorityScore: 72,
    priorityReasons: ['Direct root cause of ongoing surface flooding', 'Multiple complaints filed within 100 meters'],
    safetyRisk: false,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Drainage',
    assignedTo: 'Officer Ramesh Kumar'
  },
  {
    complaintId: 'CAI-1003',
    description: 'Knee-deep dirty flood water accumulated outside metro station entrance on Main Road. Pedestrians unable to walk.',
    category: 'Waterlogging',
    summary: 'Extensive stagnant water collection blocking pedestrian transit at metro gateway.',
    location: { latitude: 12.9720, longitude: 77.5942, address: 'Main Road Metro Gate 2' },
    priority: 'HIGH',
    priorityScore: 80,
    priorityReasons: ['Mass public transit bottleneck', 'Pedestrian mobility restricted', 'Health risk from stagnant drainage runoff'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'UNDER REVIEW',
    assignedDepartment: 'Drainage',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1004',
    description: 'Sewage overflow mixing with rainwater on Main Road service lane. Strong foul odor.',
    category: 'Drainage',
    summary: 'Sewage leakage into storm runoff generating biohazard contamination.',
    location: { latitude: 12.9712, longitude: 77.5950, address: 'Main Road Service Lane #4' },
    priority: 'HIGH',
    priorityScore: 75,
    priorityReasons: ['Public sanitation hazard', 'Correlated with Main Road waterlogging cluster'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Drainage',
    assignedTo: 'Officer S. Mehta'
  },
  {
    complaintId: 'CAI-1005',
    description: 'Large asphalt erosion and deep depression hidden underwater on Main Road. Multiple two-wheelers skidding.',
    category: 'Road Damage',
    summary: 'Submerged road cave-in creating severe accident risk for two-wheelers.',
    location: { latitude: 12.9719, longitude: 77.5944, address: 'Main Road near Bank of Baroda' },
    priority: 'CRITICAL',
    priorityScore: 89,
    priorityReasons: ['High accident severity: submerged hazard', 'Direct bodily injury risk to commuters', 'Active hotspot confluence'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'ASSIGNED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Engineer Vikram Patil'
  },
  {
    complaintId: 'CAI-1006',
    description: 'Culvert grating blocked by discarded tree branches and construction waste on Main Road corner.',
    category: 'Drainage',
    summary: 'Culvert inlet blocked by construction debris preventing drainage discharge.',
    location: { latitude: 12.9710, longitude: 77.5949, address: 'Main Road East Corner' },
    priority: 'MEDIUM',
    priorityScore: 58,
    priorityReasons: ['Restricts drainage flow', 'Contributes to broader road flooding'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'RESOLVED',
    assignedDepartment: 'Drainage',
    assignedTo: 'Crew Lead Anand'
  },
  {
    complaintId: 'CAI-1007',
    description: 'Continuous water stagnation for three consecutive days on Main Road pedestrian walkway.',
    category: 'Waterlogging',
    summary: 'Persistent pedestrian walkway stagnation causing foot-traffic diversion into vehicle lanes.',
    location: { latitude: 12.9723, longitude: 77.5941, address: 'Main Road Footpath stretch' },
    priority: 'HIGH',
    priorityScore: 68,
    priorityReasons: ['Forces pedestrians into heavy traffic lanes', 'Prolonged duration (3+ days)'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'SUBMITTED',
    assignedDepartment: 'Drainage',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1008',
    description: 'Mud and silt overflow from road excavation blocking water runoff on Main Road.',
    category: 'Road Damage',
    summary: 'Excavated silt runoff obstructing municipal roadside gutters.',
    location: { latitude: 12.9714, longitude: 77.5947, address: 'Main Road Central Divider' },
    priority: 'MEDIUM',
    priorityScore: 54,
    priorityReasons: ['Associated with ongoing roadworks', 'Secondary contribution to waterlogging'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'RESOLVED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Engineer Vikram Patil'
  },

  // --- DUPLICATE GROUP 1: COLLEGE GATE POTHOLE (3 reports) ---
  {
    complaintId: 'CAI-1010',
    description: 'Large pothole near college gate on North Avenue, bikes and scooters are slipping and falling during peak college hours.',
    category: 'Road Damage',
    summary: 'Dangerous pothole at North Avenue college entrance causing commuter falls.',
    location: { latitude: 12.9852, longitude: 77.6052, address: 'North Avenue College Gate 1' },
    priority: 'CRITICAL',
    priorityScore: 88,
    priorityReasons: ['Direct bodily harm observed', 'High student commuter density', 'Accidents repeatedly occurring'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'UNDER REVIEW',
    assignedDepartment: 'Road Maintenance',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1011',
    description: 'Huge pothole beside college entrance causing severe traffic slowdown and motorcycle accidents.',
    category: 'Road Damage',
    summary: 'Significant asphalt crater beside college entry causing traffic snarls and crashes.',
    location: { latitude: 12.9851, longitude: 77.6053, address: 'North Avenue College Gate' },
    priority: 'CRITICAL',
    priorityScore: 86,
    priorityReasons: ['Student safety hazard', 'Identified duplicate of complaint #CAI-1010'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'SUBMITTED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1012',
    description: 'Deep crater and road damage right outside college main gate. Very dangerous for two-wheelers in evening.',
    category: 'Road Damage',
    summary: 'Severe road surface collapse near college front entrance.',
    location: { latitude: 12.9853, longitude: 77.6051, address: 'North Avenue College Front Gate' },
    priority: 'CRITICAL',
    priorityScore: 85,
    priorityReasons: ['Acute physical risk', 'Identified duplicate of complaint #CAI-1010 and #CAI-1011'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'SUBMITTED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: ''
  },

  // --- DUPLICATE GROUP 2: MARKET BUS STAND GARBAGE (2 reports) ---
  {
    complaintId: 'CAI-1020',
    description: 'Garbage overflowing from municipal bins near Central Market bus stop, terrible stench and flies spreading onto food stalls.',
    category: 'Waste Management',
    summary: 'Severe municipal bin overflow at Central Market bus terminal posing public health threat.',
    location: { latitude: 12.9602, longitude: 77.5802, address: 'Central Market Bus Terminal' },
    priority: 'HIGH',
    priorityScore: 74,
    priorityReasons: ['High public food vendor proximity', 'Severe odor and pest infestation', 'Intensive foot-traffic transit hub'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Waste Management',
    assignedTo: 'Inspector Farooq'
  },
  {
    complaintId: 'CAI-1021',
    description: 'Overflowing trash bins at Central Market bus stand attracting stray animals and blocking the passenger shelter.',
    category: 'Waste Management',
    summary: 'Trash bin overflow obstructing passenger waiting shelter at Central Market.',
    location: { latitude: 12.9601, longitude: 77.5804, address: 'Central Market Bus Stand Platform B' },
    priority: 'HIGH',
    priorityScore: 72,
    priorityReasons: ['Transit shelter obstruction', 'Duplicate of #CAI-1020'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'SUBMITTED',
    assignedDepartment: 'Waste Management',
    assignedTo: ''
  },

  // --- URGENT PUBLIC SAFETY HAZARDS (3 critical standalone reports) ---
  {
    complaintId: 'CAI-1030',
    description: 'Open manhole left completely uncovered right in front of St. Jude School main entrance during morning rush hour!',
    category: 'Public Safety',
    summary: 'Uncovered deep manhole posing immediate fatal falling danger outside school entrance.',
    location: { latitude: 12.9750, longitude: 77.6100, address: 'St. Jude School Road, Gate 3' },
    priority: 'CRITICAL',
    priorityScore: 98,
    priorityReasons: ['Immediate life-safety hazard', 'Vulnerable population: school children', 'High footfall during arrival/dismissal hours'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'IN PROGRESS',
    assignedDepartment: 'Public Safety',
    assignedTo: 'Emergency Response Squad A'
  },
  {
    complaintId: 'CAI-1031',
    description: 'Sparking live electrical wire hanging loose from utility pole at head height near residential walkway.',
    category: 'Public Safety',
    summary: 'Dangling live electrical conductor with active sparking above public pedestrian walkway.',
    location: { latitude: 12.9650, longitude: 77.5920, address: '4th Cross, Greenview Colony' },
    priority: 'CRITICAL',
    priorityScore: 96,
    priorityReasons: ['Direct electrocution hazard', 'Active sparking near residential dwellings', 'Immediate public cordon required'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'ASSIGNED',
    assignedDepartment: 'Electrical',
    assignedTo: 'Quick Response Unit 4'
  },
  {
    complaintId: 'CAI-1032',
    description: 'Dangerous concrete bridge railing broken and collapsed over canal. No warning sign or barricade.',
    category: 'Public Safety',
    summary: 'Structural collapse of pedestrian canal bridge parapet without safety barriers.',
    location: { latitude: 12.9550, longitude: 77.5750, address: 'Old Canal Bridge, West Ward' },
    priority: 'CRITICAL',
    priorityScore: 91,
    priorityReasons: ['Risk of fatal fall into canal', 'Lack of warning demarcations', 'Heavy nighttime pedestrian route'],
    safetyRisk: true,
    impactLevel: 'CRITICAL',
    status: 'UNDER REVIEW',
    assignedDepartment: 'Public Safety',
    assignedTo: ''
  },

  // --- RECURRING STREETLIGHT FAILURES IN RESIDENTIAL ZONE (5 reports in cluster) ---
  {
    complaintId: 'CAI-1040',
    description: 'Entire row of streetlights not working on 8th Main Green Glen Park. Pitch black for women commuters at night.',
    category: 'Streetlight',
    summary: 'Multiple consecutive streetlight failure causing zero illumination along residential main avenue.',
    location: { latitude: 12.9781, longitude: 77.5702, address: '8th Main, Green Glen Park' },
    priority: 'HIGH',
    priorityScore: 70,
    priorityReasons: ['Public safety and crime deterrent failure', 'Impacts vulnerable night commuters'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Electrical',
    assignedTo: 'Tech Lead Pradeep'
  },
  {
    complaintId: 'CAI-1041',
    description: 'Broken lamp fixture hanging precariously from pole in Green Glen Park near children play zone.',
    category: 'Streetlight',
    summary: 'Unsecured overhead streetlight luminaire at risk of dropping in recreational zone.',
    location: { latitude: 12.9784, longitude: 77.5698, address: 'Green Glen Park Children Section' },
    priority: 'HIGH',
    priorityScore: 66,
    priorityReasons: ['Falling object hazard over playground', 'Recreation area impact'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Electrical',
    assignedTo: 'Tech Lead Pradeep'
  },
  {
    complaintId: 'CAI-1042',
    description: 'Streetlight pole timer switch malfunction, lights remain switched off all night on 7th Cross.',
    category: 'Streetlight',
    summary: 'Control timer failure preventing circuit activation across 7th Cross.',
    location: { latitude: 12.9779, longitude: 77.5708, address: '7th Cross, Green Glen Park' },
    priority: 'MEDIUM',
    priorityScore: 50,
    priorityReasons: ['Automation relay failure', 'Repeated occurrences on residential grid'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'SUBMITTED',
    assignedDepartment: 'Electrical',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1043',
    description: 'Underground cable damaged during telecom digging, cutting street illumination in Green Glen Block C.',
    category: 'Streetlight',
    summary: 'Severed electrical distribution feed following unauthorized utility trenching.',
    location: { latitude: 12.9787, longitude: 77.5715, address: 'Block C Avenue, Green Glen' },
    priority: 'MEDIUM',
    priorityScore: 55,
    priorityReasons: ['Multi-pole power supply severed', 'Requires joint utility coordination'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'RESOLVED',
    assignedDepartment: 'Electrical',
    assignedTo: 'Tech Lead Pradeep'
  },
  {
    complaintId: 'CAI-1044',
    description: 'Flickering high-mast lamp buzzing loudly and causing electrical disruption in Green Glen.',
    category: 'Streetlight',
    summary: 'High-mast luminaire ballast fault generating acoustic disturbance and intermittent lighting.',
    location: { latitude: 12.9775, longitude: 77.5695, address: 'Green Glen Junction Mast' },
    priority: 'LOW',
    priorityScore: 32,
    priorityReasons: ['Minor electrical noise', 'Low safety impact'],
    safetyRisk: false,
    impactLevel: 'LOW',
    status: 'RESOLVED',
    assignedDepartment: 'Electrical',
    assignedTo: 'Inspector Farooq'
  },

  // --- WATER SUPPLY ISSUES (4 reports) ---
  {
    complaintId: 'CAI-1050',
    description: 'Major drinking water pipeline burst on Ring Road service road, thousands of liters of clean water wasting rapidly.',
    category: 'Water Supply',
    summary: 'High-volume municipal water trunk line rupture causing substantial loss of potable supply.',
    location: { latitude: 12.9680, longitude: 77.6200, address: 'Outer Ring Road, Km 14' },
    priority: 'HIGH',
    priorityScore: 79,
    priorityReasons: ['Mass water wastage', 'Impending supply cut to downstream residential blocks'],
    safetyRisk: false,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Water Services',
    assignedTo: 'Water Engineer N. Rao'
  },
  {
    complaintId: 'CAI-1051',
    description: 'Discolored, contaminated brown water coming through municipal supply taps in Ward 12 for past 2 days.',
    category: 'Water Supply',
    summary: 'Potable water contamination with rust and sediment detected across Ward 12 residential lines.',
    location: { latitude: 12.9690, longitude: 77.6180, address: 'Ward 12 Housing Board Colony' },
    priority: 'HIGH',
    priorityScore: 76,
    priorityReasons: ['Public health risk from non-potable tap supply', 'Affected multi-family housing'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Water Services',
    assignedTo: 'Water Engineer N. Rao'
  },
  {
    complaintId: 'CAI-1052',
    description: 'Low water pressure in municipal lines preventing overhead tank filling in Sector 4.',
    category: 'Water Supply',
    summary: 'Sub-standard distribution pressure across Sector 4 distribution network.',
    location: { latitude: 12.9675, longitude: 77.6220, address: 'Sector 4, 3rd Stage' },
    priority: 'MEDIUM',
    priorityScore: 42,
    priorityReasons: ['Domestic water availability constraint', 'Standard pressure valve adjustment needed'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'RESOLVED',
    assignedDepartment: 'Water Services',
    assignedTo: 'Field Tech Mohan'
  },
  {
    complaintId: 'CAI-1053',
    description: 'Leaking water valve on street corner causing minor puddle accumulation on footpath.',
    category: 'Water Supply',
    summary: 'Minor gate valve gland packing leakage along footpath curb.',
    location: { latitude: 12.9685, longitude: 77.6195, address: 'Sector 4 Corner Gate' },
    priority: 'LOW',
    priorityScore: 28,
    priorityReasons: ['Low volume localized seepage', 'No traffic or safety impact'],
    safetyRisk: false,
    impactLevel: 'LOW',
    status: 'RESOLVED',
    assignedDepartment: 'Water Services',
    assignedTo: 'Field Tech Mohan'
  },

  // --- ADDITIONAL VARIED CIVIC ISSUES (10 reports) ---
  {
    complaintId: 'CAI-1060',
    description: 'Illegal commercial dumping of construction rubble blocking entire pedestrian lane behind commercial complex.',
    category: 'Waste Management',
    summary: 'Unauthorized dumping of masonry debris fully obstructing pedestrian thoroughfare.',
    location: { latitude: 12.9620, longitude: 77.5840, address: 'Behind Phoenix Arcade, 2nd Main' },
    priority: 'MEDIUM',
    priorityScore: 56,
    priorityReasons: ['Encroachment on public right of way', 'Demolition waste violation'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'ASSIGNED',
    assignedDepartment: 'Waste Management',
    assignedTo: 'Enforcement Squad B'
  },
  {
    complaintId: 'CAI-1061',
    description: 'Broken glass and sharp metal scrap dumped in public community playground.',
    category: 'Waste Management',
    summary: 'Hazardous metal and glass refuse deposited in children recreational field.',
    location: { latitude: 12.9635, longitude: 77.5860, address: 'Community Sports Ground' },
    priority: 'HIGH',
    priorityScore: 71,
    priorityReasons: ['Laceration hazard for playing children', 'Public recreational area compromised'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Waste Management',
    assignedTo: 'Enforcement Squad B'
  },
  {
    complaintId: 'CAI-1062',
    description: 'Fallen tree branch hanging over electrical line after thunderstorm near residential society gate.',
    category: 'Public Safety',
    summary: 'Heavy arboricultural branch resting on active power distribution cabling.',
    location: { latitude: 12.9730, longitude: 77.6010, address: 'Lakeview Enclave Main Gate' },
    priority: 'HIGH',
    priorityScore: 77,
    priorityReasons: ['Potential wire snap hazard', 'Risk of localized power blackout and fire'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Electrical',
    assignedTo: 'Emergency Response Squad A'
  },
  {
    complaintId: 'CAI-1063',
    description: 'Traffic signal at busy 4-way junction stuck on blinking amber, causing near-miss collisions during rush hour.',
    category: 'Public Transport',
    summary: 'Traffic control signal logic controller error resulting in uncontrolled junction navigation.',
    location: { latitude: 12.9790, longitude: 77.5980, address: 'Brigade Junction, 4-Way' },
    priority: 'HIGH',
    priorityScore: 82,
    priorityReasons: ['High vehicular collision risk', 'Arterial traffic intersection disrupted'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'IN PROGRESS',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Traffic Tech K. Joshi'
  },
  {
    complaintId: 'CAI-1064',
    description: 'Bus stop shelter roof corrugated metal sheet is loose and rattling violently in high wind.',
    category: 'Public Transport',
    summary: 'Detached sheet roofing on public passenger shelter posing dislodgement hazard.',
    location: { latitude: 12.9810, longitude: 77.6000, address: 'Brigade Road Bus Stop' },
    priority: 'MEDIUM',
    priorityScore: 48,
    priorityReasons: ['Wind dislodgement hazard', 'Commuter weather protection impaired'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'UNDER REVIEW',
    assignedDepartment: 'Road Maintenance',
    assignedTo: ''
  },
  {
    complaintId: 'CAI-1065',
    description: 'Road speed breaker paint completely faded, causing cars to brake suddenly and scrape chassis.',
    category: 'Road Damage',
    summary: 'Unmarked speed calming hump creating abrupt braking incidents on avenue.',
    location: { latitude: 12.9830, longitude: 77.6020, address: 'Ashok Nagar 5th Cross' },
    priority: 'LOW',
    priorityScore: 30,
    priorityReasons: ['Road cosmetic maintenance', 'Minor vehicular jolting'],
    safetyRisk: false,
    impactLevel: 'LOW',
    status: 'RESOLVED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Crew Lead Anand'
  },
  {
    complaintId: 'CAI-1066',
    description: 'Stray dog pack gathering around open garbage pile near primary school gate.',
    category: 'Public Safety',
    summary: 'Canine aggression risk associated with uncollected refuse near educational facility.',
    location: { latitude: 12.9640, longitude: 77.5810, address: 'Govt Primary School Lane' },
    priority: 'HIGH',
    priorityScore: 69,
    priorityReasons: ['Child safety vulnerability', 'Vector and animal hazard near school grounds'],
    safetyRisk: true,
    impactLevel: 'HIGH',
    status: 'ASSIGNED',
    assignedDepartment: 'Public Safety',
    assignedTo: 'Animal Control Unit'
  },
  {
    complaintId: 'CAI-1067',
    description: 'Broken concrete drain slab on pedestrian footpath creating an ankle-turn trip hazard.',
    category: 'Drainage',
    summary: 'Fractured drain cover slab on pedestrian sidewalk posing personal trip hazard.',
    location: { latitude: 12.9705, longitude: 77.5930, address: 'Richmond Road Sidewalk' },
    priority: 'MEDIUM',
    priorityScore: 45,
    priorityReasons: ['Pedestrian slip and trip hazard', 'Curb maintenance required'],
    safetyRisk: false,
    impactLevel: 'MEDIUM',
    status: 'RESOLVED',
    assignedDepartment: 'Drainage',
    assignedTo: 'Crew Lead Anand'
  },
  {
    complaintId: 'CAI-1068',
    description: 'Unauthorized commercial advertising banner tied across streetlight poles blocking driver view of road sign.',
    category: 'Other',
    summary: 'Illegal flex banner obstructing municipal directional signage.',
    location: { latitude: 12.9735, longitude: 77.5960, address: 'Commercial Road Flyover approach' },
    priority: 'LOW',
    priorityScore: 25,
    priorityReasons: ['Visual obstruction of municipal sign', 'No direct structural hazard'],
    safetyRisk: false,
    impactLevel: 'LOW',
    status: 'RESOLVED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Inspector Farooq'
  },
  {
    complaintId: 'CAI-1069',
    description: 'Routine maintenance request: roadside weeds overgrown onto asphalt shoulder.',
    category: 'Road Damage',
    summary: 'Overgrown vegetation encroaching on asphalt shoulder.',
    location: { latitude: 12.9745, longitude: 77.5975, address: 'Suburban Link Road Km 2' },
    priority: 'LOW',
    priorityScore: 20,
    priorityReasons: ['Routine landscaping maintenance', 'Zero safety threat'],
    safetyRisk: false,
    impactLevel: 'LOW',
    status: 'RESOLVED',
    assignedDepartment: 'Road Maintenance',
    assignedTo: 'Crew Lead Anand'
  }
];

export async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing reports...');
    await Report.deleteMany({});

    console.log(`[Seed] Processing and inserting ${rawSeedReports.length} synthetic reports...`);

    const processedReports = [];

    for (let i = 0; i < rawSeedReports.length; i++) {
      const item = rawSeedReports[i];

      // Build realistic status history
      const createdDate = new Date(Date.now() - (36 - i) * 3600 * 1000);
      const history = [
        {
          status: 'SUBMITTED',
          changedBy: 'Citizen Portal',
          timestamp: createdDate,
          note: 'Citizen report recorded into municipal system.'
        },
        {
          status: 'SUBMITTED',
          changedBy: 'AI Pipeline',
          timestamp: new Date(createdDate.getTime() + 60000),
          note: `AI analysis completed. Priority evaluated as ${item.priority} (${item.priorityScore}/100).`
        }
      ];

      if (item.status === 'UNDER REVIEW' || item.status === 'ASSIGNED' || item.status === 'IN PROGRESS' || item.status === 'RESOLVED') {
        history.push({
          status: 'UNDER REVIEW',
          changedBy: 'City Desk Officer',
          timestamp: new Date(createdDate.getTime() + 180000),
          note: 'Report verified and reviewed by civic intake desk.'
        });
      }

      if (item.status === 'ASSIGNED' || item.status === 'IN PROGRESS' || item.status === 'RESOLVED') {
        history.push({
          status: 'ASSIGNED',
          changedBy: 'Authority Operations',
          timestamp: new Date(createdDate.getTime() + 600000),
          note: `Work order dispatched to ${item.assignedDepartment} (Lead: ${item.assignedTo || 'Assigned Officer'}).`
        });
      }

      if (item.status === 'IN PROGRESS' || item.status === 'RESOLVED') {
        history.push({
          status: 'IN PROGRESS',
          changedBy: item.assignedTo || item.assignedDepartment,
          timestamp: new Date(createdDate.getTime() + 1800000),
          note: 'Field crew arrived on site. Remediation operations active.'
        });
      }

      if (item.status === 'RESOLVED') {
        history.push({
          status: 'RESOLVED',
          changedBy: item.assignedTo || item.assignedDepartment,
          timestamp: new Date(createdDate.getTime() + 7200000),
          note: 'Maintenance operations concluded and verified. Area restored to standard condition.'
        });
      }

      // Check duplicates against already prepared items
      const dupCheck = findDuplicatesInPool(item, processedReports);

      processedReports.push({
        ...item,
        aiCategory: item.category,
        aiCategoryConfidence: 0.94,
        duplicatePossible: dupCheck.duplicatePossible,
        duplicateStatus: dupCheck.duplicateStatus,
        duplicateTier: dupCheck.duplicateTier,
        duplicateOf: dupCheck.duplicateOf,
        duplicateReportIds: dupCheck.duplicateReportIds,
        duplicateScore: dupCheck.duplicateScore,
        duplicateExplanation: dupCheck.duplicateExplanation,
        duplicateReason: dupCheck.duplicateReason,
        duplicateReasons: dupCheck.duplicateReasons,
        actionBrief: `Deploy ${item.assignedDepartment} response team to inspect ${item.location.address}. Remediate ${item.category} condition promptly.`,
        keywords: [item.category.toLowerCase(), item.priority.toLowerCase(), 'civic'],
        statusHistory: history,
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + 7200000)
      });
    }

    await Report.insertMany(processedReports);

    console.log(`[Seed] Successfully seeded ${processedReports.length} reports into CivicActionAI database!`);
    console.log(`[Seed] Summary of Seed Data:`);
    const criticalCount = processedReports.filter(r => r.priority === 'CRITICAL').length;
    const highCount = processedReports.filter(r => r.priority === 'HIGH').length;
    const medCount = processedReports.filter(r => r.priority === 'MEDIUM').length;
    const lowCount = processedReports.filter(r => r.priority === 'LOW').length;
    const dupCount = processedReports.filter(r => r.duplicatePossible).length;
    const resolvedCount = processedReports.filter(r => r.status === 'RESOLVED').length;
    const inProgCount = processedReports.filter(r => r.status === 'IN PROGRESS').length;

    console.log(`  - Total Reports: ${processedReports.length}`);
    console.log(`  - Critical: ${criticalCount}, High: ${highCount}, Medium: ${medCount}, Low: ${lowCount}`);
    console.log(`  - Duplicates Detected: ${dupCount}`);
    console.log(`  - In Progress: ${inProgCount}, Resolved: ${resolvedCount}`);
    console.log(`  - Hotspots: Concentrated cluster on Main Road with 8+ reports.`);

    await disconnectDB();
    console.log('[Seed] Database disconnected cleanly.');
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}

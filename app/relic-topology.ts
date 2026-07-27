export type Vec3Tuple = [number, number, number];
export type Vec2Tuple = [number, number];

export type RelicFragmentTopology = {
  id: string;
  role: "main" | "medium" | "contour" | "debris";
  polygon: Vec2Tuple[];
  thickness: number;
  dormantPosition: Vec3Tuple;
  dormantRotation: Vec3Tuple;
  collapsePosition: Vec3Tuple;
  collapseRotation: Vec3Tuple;
  delay: number;
};

export type RelicProject = {
  id: string;
  title: string;
  year: string;
  tags: string[];
  nodeLabels: string[];
  masterArtwork: string;
  environmentTint: string;
  signalColor?: string;
  viewUrl?: string;
  sourceUrl?: string;
};

export type PrivateTrace = {
  id: string;
  image: string;
  timestamp?: string;
  shortLabel?: string;
  depth: number;
  crop?: string;
};

export const privateTraces: PrivateTrace[] = [];

// Fixed offline topology. These twelve cells are never regenerated at runtime.
export const RELIC_TOPOLOGY_SEED = "rain-dust-relic-v6-earth-042";

export const RELIC_TOPOLOGY: RelicFragmentTopology[] = [
  {
    id: "relic-main-east",
    role: "main",
    polygon: [[58, 18], [88, 13], [96, 35], [91, 61], [75, 67], [59, 55]],
    thickness: 0.34,
    dormantPosition: [7.8, 1.5, -8.8],
    dormantRotation: [-0.38, -1.08, 0.21],
    collapsePosition: [12.5, -0.6, 5.2],
    collapseRotation: [0.4, 1.3, -0.26],
    delay: 0,
  },
  {
    id: "relic-medium-north",
    role: "medium",
    polygon: [[23, 10], [55, 8], [58, 34], [43, 42], [19, 31]],
    thickness: 0.27,
    dormantPosition: [-3.6, 6.1, -11.5],
    dormantRotation: [0.72, 0.54, -0.6],
    collapsePosition: [-5.4, 5.8, -10.4],
    collapseRotation: [-0.5, -0.72, 0.8],
    delay: 0.08,
  },
  {
    id: "relic-medium-south",
    role: "medium",
    polygon: [[54, 61], [76, 66], [89, 84], [80, 94], [50, 91], [43, 75]],
    thickness: 0.29,
    dormantPosition: [1.2, -6.8, -9.2],
    dormantRotation: [-0.68, 0.81, 0.54],
    collapsePosition: [4.8, -6.2, -12],
    collapseRotation: [0.62, -0.55, -0.75],
    delay: 0.13,
  },
  {
    id: "relic-contour-west",
    role: "contour",
    polygon: [[4, 23], [21, 17], [27, 39], [20, 56], [7, 52], [2, 38]],
    thickness: 0.2,
    dormantPosition: [-9.8, 0.5, -7.2],
    dormantRotation: [0.32, 1.2, -0.42],
    collapsePosition: [-12, 1.8, -4],
    collapseRotation: [-0.3, -1.4, 0.35],
    delay: 0.17,
  },
  {
    id: "relic-contour-northeast",
    role: "contour",
    polygon: [[60, 6], [83, 4], [94, 13], [88, 27], [60, 29]],
    thickness: 0.19,
    dormantPosition: [5.8, 5.9, -13],
    dormantRotation: [-0.9, -0.65, 0.38],
    collapsePosition: [8.4, 6.8, -7.4],
    collapseRotation: [0.75, 0.88, -0.55],
    delay: 0.21,
  },
  {
    id: "relic-contour-midwest",
    role: "contour",
    polygon: [[11, 58], [29, 43], [43, 48], [42, 69], [26, 77], [8, 70]],
    thickness: 0.23,
    dormantPosition: [-7.3, -2.2, -10.8],
    dormantRotation: [-0.55, 0.95, 0.6],
    collapsePosition: [-9.2, -4.1, -9],
    collapseRotation: [0.45, -1.05, -0.7],
    delay: 0.24,
  },
  {
    id: "relic-contour-east",
    role: "contour",
    polygon: [[91, 42], [99, 39], [100, 72], [91, 79], [78, 69]],
    thickness: 0.18,
    dormantPosition: [10.6, -1.4, -11.6],
    dormantRotation: [0.8, -1.2, -0.3],
    collapsePosition: [13.2, -3.5, -3.2],
    collapseRotation: [-0.6, 1.45, 0.4],
    delay: 0.28,
  },
  {
    id: "relic-contour-southwest",
    role: "contour",
    polygon: [[17, 78], [42, 71], [49, 93], [33, 99], [12, 93]],
    thickness: 0.22,
    dormantPosition: [-5.8, -6.6, -12.7],
    dormantRotation: [0.94, 0.5, -0.72],
    collapsePosition: [-7.5, -7.2, -6.4],
    collapseRotation: [-0.82, -0.65, 0.9],
    delay: 0.31,
  },
  {
    id: "relic-debris-a",
    role: "debris",
    polygon: [[1, 8], [12, 5], [16, 15], [6, 20]],
    thickness: 0.13,
    dormantPosition: [-11.5, 6.8, -16],
    dormantRotation: [1.2, 0.5, 1.1],
    collapsePosition: [-10.3, 7.8, -15],
    collapseRotation: [-1, -0.8, -1.2],
    delay: 0.34,
  },
  {
    id: "relic-debris-b",
    role: "debris",
    polygon: [[92, 2], [100, 5], [98, 14], [91, 11]],
    thickness: 0.12,
    dormantPosition: [11.8, 7.3, -18],
    dormantRotation: [-1, 1.3, 0.7],
    collapsePosition: [14, 5.5, -12.5],
    collapseRotation: [1.3, -1, -0.9],
    delay: 0.37,
  },
  {
    id: "relic-debris-c",
    role: "debris",
    polygon: [[1, 83], [10, 78], [14, 91], [7, 98]],
    thickness: 0.11,
    dormantPosition: [-12.4, -7.1, -15.5],
    dormantRotation: [1.4, -0.9, -1],
    collapsePosition: [-14.2, -5.8, -11],
    collapseRotation: [-1.1, 1.2, 0.8],
    delay: 0.4,
  },
  {
    id: "relic-debris-d",
    role: "debris",
    polygon: [[91, 83], [99, 79], [100, 96], [93, 99], [88, 91]],
    thickness: 0.14,
    dormantPosition: [12.8, -7.4, -17],
    dormantRotation: [-1.3, -0.7, 1.2],
    collapsePosition: [11.6, -8.4, -14.4],
    collapseRotation: [1, 0.95, -1.1],
    delay: 0.43,
  },
];

export const EARTH_PROJECT: RelicProject = {
  id: "earth",
  title: "EARTH ONLINE",
  year: "2026",
  tags: ["THREE.JS", "LOCAL-FIRST", "EXPERIMENT"],
  nodeLabels: ["WORLD", "RUNTIME", "RECORD", "LOCAL"],
  masterArtwork: "/rain-dust/masters/earth-night-master.webp",
  environmentTint: "#171120",
  signalColor: "#A91528",
  sourceUrl: "https://github.com/Rain-dust/earth-online",
};

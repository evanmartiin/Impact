import { CatmullRomCurve3, Vector3 } from "three";

const introSettings = {
  pipeSpline: new CatmullRomCurve3([
    new Vector3(0.82308394348547, 0.25, 0.40098479075095),
    new Vector3(0.82308394348547, 0.24173913043478, 0.36613802259126),
    new Vector3(0.80955245260884, 0.23347826086957, 0.21999802213577),
    new Vector3(0.77346790486263, 0.22521739130435, 0.05067822117326),
    new Vector3(0.69297160604492, 0.21695652173913, -0.11860707992309),
    new Vector3(0.58749369724774, 0.20869565217391, -0.26297977077502),
    new Vector3(0.49589446066148, 0.2004347826087, -0.36568194512893),
    new Vector3(0.33212612858279, 0.19217391304348, -0.49336572946231),
    new Vector3(0.17390926538792, 0.18391304347826, -0.5683105593962),
    new Vector3(0.01014093330923, 0.17565217391304, -0.59322316963971),
    new Vector3(-0.15640313321182, 0.16739130434783, -0.57108629383856),
    new Vector3(-0.29796558975522, 0.15913043478261, -0.51002013611378),
    new Vector3(-0.40899496743532, 0.15086956521739, -0.41009369620133),
    new Vector3(-0.50336993846395, 0.14260869565217, -0.28518564631122),
    new Vector3(-0.55610889286254, 0.13434782608696, -0.15472612753638),
    new Vector3(-0.57516992946512, 0.12608695652174, 0),
    new Vector3(-0.55610889286254, 0.11782608695652, 0.10064144112948),
    new Vector3(-0.4922670006963, 0.1095652173913, 0.21722228769431),
    new Vector3(-0.41177070187769, 0.10130434782609, 0.2921671176282),
    new Vector3(-0.32294719973288, 0.09304347826087, 0.3365788687006),
    new Vector3(-0.21191782205278, 0.08478260869565, 0.35600900979443),
    new Vector3(-0.11674172773837, 0.07652173913043, 0.32501307920666),
    new Vector3(-0.05902645785045, 0.06826086956522, 0.2723605522915),
  ]),
};
export default introSettings;

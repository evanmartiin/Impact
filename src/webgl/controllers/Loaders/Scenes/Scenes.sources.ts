import type { ISource } from "@/types/webgl/source.model";
import citySources from "./City.sources";
import commonSources from "./Common.sources";
import earthSources from "./Earth.sources";
import grandmaSources from "./Grandma.sources";
import homeSources from "./Home.sources";

const sourceGroups = [
  earthSources,
  homeSources,
  citySources,
  grandmaSources,
  commonSources,
];

const Sources = () => {
  const sources: ISource[] = [];
  sourceGroups.forEach((sourceGroup) => {
    sourceGroup.forEach((s) => {
      sources.push(s);
    });
  });
  return sources;
};

export default Sources;

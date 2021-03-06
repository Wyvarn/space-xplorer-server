import { spaceXApiBaseUrl } from '@config';
import { Launch, LaunchResponse } from './model';
import { RESTDataSource } from 'apollo-datasource-rest';

export default class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = spaceXApiBaseUrl;
  }

  async getAllLaunches(): Promise<LaunchResponse[]> {
    const response = await this.get('launches');
    return Array.isArray(response) ? response.map((launch) => this.launchReducer(launch)) : [];
  }

  async getLaunchById(launchId: number): Promise<LaunchResponse> {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  async getLaunchesByIds(launchIds: number[]): Promise<LaunchResponse[]> {
    return Promise.all(launchIds.map((launchId) => this.getLaunchById(launchId)));
  }

  launchReducer(launch: Launch): LaunchResponse {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
}

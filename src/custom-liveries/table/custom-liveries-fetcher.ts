import { CustomLiveryRepository } from '@/db/custom-livery-repository';
import { ModelRepository } from '@/db/model-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { CustomLivery } from '@/shared/models/livery';
import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';

export type CustomLiveryWithModelInfo = CustomLivery & {
  class: string;
  model: string;
};

@Service({ autoProvided: false })
export class CustomLiveriesFetcher {
  private readonly customLiveryRepository = inject(CustomLiveryRepository);
  private readonly vehicleClassRepository = inject(VehicleClassRepository);
  private readonly vehicleModelRepository = inject(ModelRepository);

  public getCustomLiveriesWithModelInfo(): Observable<CustomLiveryWithModelInfo[]> {
    return combineLatest({
      customLiveries: this.customLiveryRepository.getAllCustomLiveries(),
      vehicleClasses: this.vehicleClassRepository.getAllVehicleClasses(),
      vehicleModels: this.vehicleModelRepository.getAllModels(),
    }).pipe(
      map(({ customLiveries, vehicleClasses, vehicleModels }) =>
        customLiveries.map((livery) => {
          const vehicleModel = vehicleModels.find(
            (model) => model.folder_name === livery.folder_name,
          );
          const vehicleClass = vehicleClasses.find((vc) => vc.id === vehicleModel?.class);
          return {
            ...livery,
            class: vehicleClass?.name ?? '',
            model: vehicleModel?.name ?? '',
          };
        }),
      ),
    );
  }
}

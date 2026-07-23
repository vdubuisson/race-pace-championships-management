import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { inject, resource, Service } from '@angular/core';

@Service()
export class VehicleClassUtils {
  private readonly vehicleClassRepository = inject(VehicleClassRepository);

  readonly vehicleClasses = resource({
    loader: () => this.vehicleClassRepository.getAllVehicleClasses(),
    defaultValue: [],
  });

  getVehicleClassName(classId: string): string | null | undefined {
    return this.vehicleClasses.value().find((vehicleClass) => vehicleClass.id === classId)?.name;
  }

  getIsVehicleClassMod(classId: string): boolean {
    return (
      this.vehicleClasses.value().find((vehicleClass) => vehicleClass.id === classId)?.is_mod ??
      true
    );
  }
}

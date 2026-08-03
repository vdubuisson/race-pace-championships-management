import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vehicleClassMod',
  pure: false,
})
export class VehicleClassModPipe implements PipeTransform {
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  transform(id: string): boolean {
    return this.vehicleClassUtils.getIsVehicleClassMod(id);
  }
}

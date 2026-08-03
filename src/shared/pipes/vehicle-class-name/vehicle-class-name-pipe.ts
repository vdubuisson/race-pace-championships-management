import { VehicleClassUtils } from '@/shared/services/vehicle-class-utils/vehicle-class-utils';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vehicleClassName',
  pure: false,
})
export class VehicleClassNamePipe implements PipeTransform {
  private readonly vehicleClassUtils = inject(VehicleClassUtils);

  transform(id: string): string {
    return this.vehicleClassUtils.getVehicleClassName(id) ?? id;
  }
}

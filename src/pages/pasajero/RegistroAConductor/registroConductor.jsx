import React, { useState, useEffect } from 'react';
import styles from './registroConductor.module.css';
import { X, CarFront, Bike, UploadCloud, ChevronRight, ChevronLeft, CalendarDays, ClipboardPenLine, ShieldCheck, Image as ImageIcon, Construction } from 'lucide-react';

const VehicleRegistrationModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('SELECT_CATEGORY'); // SELECT_CATEGORY, OUTSIDE_CAMPUS_1, OUTSIDE_CAMPUS_2, INSIDE_CAMPUS
  const [vehicleCategory, setVehicleCategory] = useState(null); // 'outside', 'inside'

  const initialFormData = {
    // Fuera del Campus
    outside_vehicleType: '',
    outside_tripCategory: '',
    outside_licensePlate: '',
    outside_licenseDocument: null,
    outside_brand: '',
    outside_modelYear: '',
    outside_soatExpiryDate: '',
    outside_soatDocument: null,
    outside_tecnoExpiryDate: '',
    outside_tecnoDocument: null,
    outside_vehiclePhoto: null,
    // Dentro del Campus
    inside_vehicleType: '',
    inside_brand: '',
    inside_status: '',
    inside_vehiclePhoto: null,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset form when modal is closed or category changes significantly
    if (!isOpen) {
      setStep('SELECT_CATEGORY');
      setVehicleCategory(null);
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: null}));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
       if (errors[name]) {
        setErrors(prev => ({...prev, [name]: null}));
      }
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 'OUTSIDE_CAMPUS_1') {
      if (!formData.outside_vehicleType) newErrors.outside_vehicleType = 'Seleccione un tipo de vehículo.';
      if (!formData.outside_tripCategory) newErrors.outside_tripCategory = 'Seleccione una categoría de viaje.';
      if (!formData.outside_licensePlate) newErrors.outside_licensePlate = 'Ingrese el número de placa.';
      else if (!/^[A-Z0-9]{5,7}$/i.test(formData.outside_licensePlate)) newErrors.outside_licensePlate = 'Placa inválida (ej: AAA123 o AAA12B).';
      if (!formData.outside_licenseDocument) newErrors.outside_licenseDocument = 'Suba la licencia de conducción.';
    } else if (step === 'OUTSIDE_CAMPUS_2') {
      if (!formData.outside_brand) newErrors.outside_brand = 'Seleccione la marca del vehículo.';
      if (!formData.outside_modelYear) newErrors.outside_modelYear = 'Ingrese el modelo (año).';
      else if (!/^(19[5-9]\d|20\d{2})$/.test(formData.outside_modelYear)) newErrors.outside_modelYear = 'Año inválido (1950-20xx).';
      if (!formData.outside_soatExpiryDate) newErrors.outside_soatExpiryDate = 'Ingrese la fecha de vigencia del SOAT.';
      if (!formData.outside_soatDocument) newErrors.outside_soatDocument = 'Suba el documento SOAT.';
      if (!formData.outside_tecnoExpiryDate) newErrors.outside_tecnoExpiryDate = 'Ingrese la fecha de vencimiento del tecnomecánico.';
      if (!formData.outside_tecnoDocument) newErrors.outside_tecnoDocument = 'Suba el documento tecnomecánico.';
      if (!formData.outside_vehiclePhoto) newErrors.outside_vehiclePhoto = 'Suba una foto del vehículo.';
    } else if (step === 'INSIDE_CAMPUS') {
      if (!formData.inside_vehicleType) newErrors.inside_vehicleType = 'Seleccione un tipo de vehículo.';
      if (!formData.inside_brand) newErrors.inside_brand = 'Seleccione la marca del vehículo.';
      if (!formData.inside_status) newErrors.inside_status = 'Seleccione el estado del vehículo.';
      if (!formData.inside_vehiclePhoto) newErrors.inside_vehiclePhoto = 'Suba una foto del vehículo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 'SELECT_CATEGORY') {
        if (vehicleCategory === 'outside') setStep('OUTSIDE_CAMPUS_1');
        else if (vehicleCategory === 'inside') setStep('INSIDE_CAMPUS');
    } else if (step === 'OUTSIDE_CAMPUS_1') {
        setStep('OUTSIDE_CAMPUS_2');
    }
  };

  const handleBack = () => {
    setErrors({}); // Clear errors when going back
    if (step === 'OUTSIDE_CAMPUS_1' || step === 'INSIDE_CAMPUS') {
      setStep('SELECT_CATEGORY');
      setVehicleCategory(null); // Deselect category
    } else if (step === 'OUTSIDE_CAMPUS_2') {
      setStep('OUTSIDE_CAMPUS_1');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    console.log('Formulario Enviado:', formData);
    // Aquí iría la lógica para enviar los datos al backend
    alert('Vehículo registrado exitosamente (ver consola para datos).');
    onClose(); // Cierra el modal después de enviar
  };

  if (!isOpen) return null;

  const renderCategorySelection = () => (
    <div className={styles.categorySelectionContainer}>
      <div
        className={`${styles.categoryCard} ${vehicleCategory === 'outside' ? styles.selected : ''}`}
        onClick={() => setVehicleCategory('outside')}
      >
        <CarFront />
        <p>Vehículo Fuera del Campus</p>
        <span>(Moto, Carro, Bus, etc.)</span>
      </div>
      <div
        className={`${styles.categoryCard} ${vehicleCategory === 'inside' ? styles.selected : ''}`}
        onClick={() => setVehicleCategory('inside')}
      >
        <Bike />
        <p>Vehículo Dentro del Campus</p>
        <span>(Bicicleta, Patineta, etc.)</span>
      </div>
    </div>
  );

  const renderOutsideCampusStep1 = () => (
    <div className={styles.formStepContainer}>
      <h3>Detalles del Vehículo (Fuera de Campus) - Paso 1 de 2</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="outside_vehicleType">Tipo de Vehículo</label>
          <select id="outside_vehicleType" name="outside_vehicleType" value={formData.outside_vehicleType} onChange={handleInputChange} className={styles.select}>
            <option value="">Seleccione...</option>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
            <option value="bus">Bus</option>
            <option value="buseta">Buseta</option>
            <option value="otro">Otro</option>
          </select>
          {errors.outside_vehicleType && <span className={styles.errorText}>{errors.outside_vehicleType}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_tripCategory">Categoría de Viaje</label>
          <select id="outside_tripCategory" name="outside_tripCategory" value={formData.outside_tripCategory} onChange={handleInputChange} className={styles.select}>
            <option value="">Seleccione...</option>
            <option value="fuera_ciudad">Fuera de la ciudad</option>
            <option value="dentro_ciudad">Dentro de la ciudad</option>
            <option value="dentro_campus">Dentro del campus</option>
          </select>
          {errors.outside_tripCategory && <span className={styles.errorText}>{errors.outside_tripCategory}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_licensePlate">Número de Placa</label>
          <input type="text" id="outside_licensePlate" name="outside_licensePlate" value={formData.outside_licensePlate} onChange={handleInputChange} className={styles.input} placeholder="AAA123" />
          {errors.outside_licensePlate && <span className={styles.errorText}>{errors.outside_licensePlate}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_licenseDocument">Licencia de Conducción (PDF, JPG, PNG)</label>
          <input type="file" id="outside_licenseDocument" name="outside_licenseDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
          <label htmlFor="outside_licenseDocument" className={styles.fileInputLabel}>
            <ClipboardPenLine size={16}/> Subir Licencia
          </label>
          {formData.outside_licenseDocument && <span className={styles.fileName}>{formData.outside_licenseDocument.name}</span>}
          {errors.outside_licenseDocument && <span className={styles.errorText}>{errors.outside_licenseDocument}</span>}
        </div>
      </div>
    </div>
  );

  const renderOutsideCampusStep2 = () => (
    <div className={styles.formStepContainer}>
      <h3>Detalles del Vehículo (Fuera de Campus) - Paso 2 de 2</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="outside_brand">Marca del Vehículo</label>
          <select id="outside_brand" name="outside_brand" value={formData.outside_brand} onChange={handleInputChange} className={styles.select}>
            <option value="">Seleccione...</option>
            <option value="chevrolet">Chevrolet</option>
            <option value="renault">Renault</option>
            <option value="mazda">Mazda</option>
            <option value="kia">Kia</option>
            <option value="nissan">Nissan</option>
            <option value="toyota">Toyota</option>
            <option value="ford">Ford</option>
            <option value="volkswagen">Volkswagen</option>
            <option value="suzuki">Suzuki</option>
            <option value="yamaha">Yamaha (Motos)</option>
            <option value="honda">Honda (Motos)</option>
            <option value="bajaj">Bajaj (Motos)</option>
            <option value="akt">AKT (Motos)</option>
            <option value="otro">Otro</option>
          </select>
          {errors.outside_brand && <span className={styles.errorText}>{errors.outside_brand}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_modelYear">Modelo (Año)</label>
          <input type="number" id="outside_modelYear" name="outside_modelYear" value={formData.outside_modelYear} onChange={handleInputChange} className={styles.input} placeholder="Ej: 2020" min="1950" max={new Date().getFullYear() + 1} />
          {errors.outside_modelYear && <span className={styles.errorText}>{errors.outside_modelYear}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_soatExpiryDate">Vigencia SOAT</label>
          <input type="date" id="outside_soatExpiryDate" name="outside_soatExpiryDate" value={formData.outside_soatExpiryDate} onChange={handleInputChange} className={styles.input} />
          {errors.outside_soatExpiryDate && <span className={styles.errorText}>{errors.outside_soatExpiryDate}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_soatDocument">Documento SOAT (PDF, JPG, PNG)</label>
          <input type="file" id="outside_soatDocument" name="outside_soatDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
          <label htmlFor="outside_soatDocument" className={styles.fileInputLabel}>
             <ShieldCheck size={16}/> Subir SOAT
          </label>
          {formData.outside_soatDocument && <span className={styles.fileName}>{formData.outside_soatDocument.name}</span>}
          {errors.outside_soatDocument && <span className={styles.errorText}>{errors.outside_soatDocument}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_tecnoExpiryDate">Vencimiento Tecnomecánico</label>
          <input type="date" id="outside_tecnoExpiryDate" name="outside_tecnoExpiryDate" value={formData.outside_tecnoExpiryDate} onChange={handleInputChange} className={styles.input} />
          {errors.outside_tecnoExpiryDate && <span className={styles.errorText}>{errors.outside_tecnoExpiryDate}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="outside_tecnoDocument">Documento Tecnomecánico (PDF, JPG, PNG)</label>
          <input type="file" id="outside_tecnoDocument" name="outside_tecnoDocument" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
          <label htmlFor="outside_tecnoDocument" className={styles.fileInputLabel}>
            <Construction size={16}/> Subir Tecnomecánico
          </label>
          {formData.outside_tecnoDocument && <span className={styles.fileName}>{formData.outside_tecnoDocument.name}</span>}
          {errors.outside_tecnoDocument && <span className={styles.errorText}>{errors.outside_tecnoDocument}</span>}
        </div>
        <div className={`${styles.formGroup} ${styles.formGroupFullWidth}`}>
          <label htmlFor="outside_vehiclePhoto">Foto del Vehículo (JPG, PNG)</label>
          <input type="file" id="outside_vehiclePhoto" name="outside_vehiclePhoto" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
          <label htmlFor="outside_vehiclePhoto" className={styles.fileInputLabel}>
             <ImageIcon size={16}/> Subir Foto del Vehículo
          </label>
          {formData.outside_vehiclePhoto && <span className={styles.fileName}>{formData.outside_vehiclePhoto.name}</span>}
          {errors.outside_vehiclePhoto && <span className={styles.errorText}>{errors.outside_vehiclePhoto}</span>}
        </div>
      </div>
    </div>
  );

  const renderInsideCampusForm = () => (
    <div className={styles.formStepContainer}>
        <h3>Detalles del Vehículo (Dentro de Campus)</h3>
        <div className={styles.formGrid}>
            <div className={styles.formGroup}>
                <label htmlFor="inside_vehicleType">Tipo de Vehículo</label>
                <select id="inside_vehicleType" name="inside_vehicleType" value={formData.inside_vehicleType} onChange={handleInputChange} className={styles.select}>
                    <option value="">Seleccione...</option>
                    <option value="bicicleta">Bicicleta</option>
                    <option value="patineta">Patineta</option>
                    <option value="scooter">Scooter Eléctrico</option>
                    <option value="triciclo">Triciclo</option>
                    <option value="otro">Otro</option>
                </select>
                {errors.inside_vehicleType && <span className={styles.errorText}>{errors.inside_vehicleType}</span>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="inside_brand">Marca del Vehículo</label>
                <select id="inside_brand" name="inside_brand" value={formData.inside_brand} onChange={handleInputChange} className={styles.select}>
                    <option value="">Seleccione...</option>
                    <option value="gw">GW (Bicicletas)</option>
                    <option value="specialized">Specialized (Bicicletas)</option>
                    <option value="trek">Trek (Bicicletas)</option>
                    <option value="xiaomi">Xiaomi (Scooters)</option>
                    <option value="segway">Segway (Scooters)</option>
                    <option value="element">Element (Patinetas)</option>
                    <option value="santa_cruz">Santa Cruz (Patinetas)</option>
                    <option value="marca_generica">Marca Genérica</option>
                    <option value="otro">Otro</option>
                </select>
                {errors.inside_brand && <span className={styles.errorText}>{errors.inside_brand}</span>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="inside_status">Estado del Vehículo</label>
                <select id="inside_status" name="inside_status" value={formData.inside_status} onChange={handleInputChange} className={styles.select}>
                    <option value="">Seleccione...</option>
                    <option value="bueno">Buen estado</option>
                    <option value="medio">Medio estado</option>
                    <option value="malo">Mal estado</option>
                </select>
                {errors.inside_status && <span className={styles.errorText}>{errors.inside_status}</span>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="inside_vehiclePhoto">Foto del Vehículo (JPG, PNG)</label>
                <input type="file" id="inside_vehiclePhoto" name="inside_vehiclePhoto" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                 <label htmlFor="inside_vehiclePhoto" className={styles.fileInputLabel}>
                    <ImageIcon size={16}/> Subir Foto
                </label>
                {formData.inside_vehiclePhoto && <span className={styles.fileName}>{formData.inside_vehiclePhoto.name}</span>}
                {errors.inside_vehiclePhoto && <span className={styles.errorText}>{errors.inside_vehiclePhoto}</span>}
            </div>
        </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Registrar Vehículo</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar modal">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 'SELECT_CATEGORY' && renderCategorySelection()}
          {step === 'OUTSIDE_CAMPUS_1' && renderOutsideCampusStep1()}
          {step === 'OUTSIDE_CAMPUS_2' && renderOutsideCampusStep2()}
          {step === 'INSIDE_CAMPUS' && renderInsideCampusForm()}

          <div className={`${styles.buttonContainer} ${step === 'SELECT_CATEGORY' && !vehicleCategory ? styles.singleButton : ''}`}>
            {step !== 'SELECT_CATEGORY' && (
              <button type="button" onClick={handleBack} className={styles.secondaryButton}>
                <ChevronLeft size={18} style={{verticalAlign: 'middle'}}/> Atrás
              </button>
            )}
            {step === 'SELECT_CATEGORY' && vehicleCategory && (
              <button type="button" onClick={handleNext} className={styles.primaryButton}>
                Siguiente <ChevronRight size={18} style={{verticalAlign: 'middle'}}/>
              </button>
            )}
            {(step === 'OUTSIDE_CAMPUS_1') && (
              <button type="button" onClick={handleNext} className={styles.primaryButton}>
                Siguiente <ChevronRight size={18} style={{verticalAlign: 'middle'}}/>
              </button>
            )}
            {(step === 'OUTSIDE_CAMPUS_2' || step === 'INSIDE_CAMPUS') && (
              <button type="submit" className={styles.primaryButton}>
                Registrar Vehículo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistrationModal;
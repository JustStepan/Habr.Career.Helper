import TextForm from '@/components/form_experiments/TextForm';
import NumberForm from '@/components/form_experiments/NumberForm';
import EmailForm from '@/components/form_experiments/EmailForm';
import TextAreaForm from '@/components/form_experiments/TextAreaForm';
import CheckboxForm from '@/components/form_experiments/CheckboxForm';
import SelectForm from '@/components/form_experiments/SelectForm';
import DateForm from '@/components/form_experiments/DateForm';


function ExperimentForm() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* ✅ max-w-2xl = макс ширина */}
            {/* ✅ mx-auto = центрировать контейнер */}
            {/* ✅ py-8 = отступ сверху и снизу */}
            
            <h1 className="text-3xl font-bold mb-6 text-center">
                {/* ✅  text-center - размещаем текст по центру */}
                Тестирование форм ввода
            </h1>
            
            <TextForm />
            
            <hr className="my-8" />
            {/* ✅ my-8 = отступ сверху и снизу */}
            
            <NumberForm />
            <hr className="my-8" />

            <EmailForm />
            <hr className="my-8" />

            <TextAreaForm />
            <hr className="my-8" />

            <CheckboxForm />
            <hr className="my-8" />

            <SelectForm />
            <hr className="my-8" />

            <DateForm />
            <hr className="my-8" />
        </div>
    );
}

export default ExperimentForm;
import React, { useState, useEffect } from 'react';
import { ProductReview } from '../types';
import { reviewService } from '../services/reviewService';
import { Star, CheckCircle, MessageSquare, Send, Sparkles } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setLoading(true);
      const data = await reviewService.getApprovedReviews(productId);
      if (isMounted) {
        setReviews(data);
        setLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    setSubmitting(true);
    setFeedbackMessage(null);

    const res = await reviewService.submitReview({
      productId,
      userName,
      userEmail,
      rating,
      title,
      comment
    });

    setSubmitting(false);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setFeedbackMessage(res.message);
      setComment('');
      setTitle('');
      setShowForm(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="mt-16 pt-12 border-t border-slate-200">
      <div className="max-w-4xl">
        {/* Cabecera y Resumen de Calificaciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500]"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono">
                Opiniones Verificadas
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Calificaciones de Clientes
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-lg font-black text-slate-900">{averageRating} de 5</span>
              <span className="text-xs text-slate-500 font-medium">({reviews.length} opiniones registradas)</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-[#ff5500] text-white font-extrabold text-xs tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showForm ? 'Cerrar Formulario' : 'Escribir una Opinión'}</span>
          </button>
        </div>

        {/* Mensaje de Confirmación */}
        {feedbackMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Formulario para Dejar Opinión */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-10 p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4 animate-in fade-in duration-200">
            <h3 className="font-extrabold text-slate-900 text-base">Comparte tu experiencia con {productName}</h3>

            {/* Selector de Estrellas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tu Puntuación General *</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-hidden cursor-pointer"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600">
                  {rating === 5 ? 'Excelente ⭐⭐⭐⭐⭐' : rating === 4 ? 'Muy Bueno ⭐⭐⭐⭐' : `${rating} estrellas`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre o Ferretería *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller Metalmecánico Pérez"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#ff5500] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="Para validar compra verificada"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#ff5500] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titular de tu Reseña (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Excelente rendimiento en obra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#ff5500] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tu Comentario Detallado *</label>
              <textarea
                required
                rows={3}
                placeholder="Cuéntanos sobre la calidad, el embalaje, el uso en trabajo o la atención recibida..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#ff5500] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !userName.trim() || !comment.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04800] text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publicando...' : 'Publicar Opinión'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Listado de Reseñas */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center uppercase">
                    {rev.user_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{rev.user_name}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        <CheckCircle className="w-2.5 h-2.5" /> Compra Verificada
                      </span>
                    </div>
                    <div className="flex items-center text-amber-400 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(rev.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {rev.title && (
                <h4 className="font-extrabold text-xs text-slate-900 mt-1 mb-1">{rev.title}</h4>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

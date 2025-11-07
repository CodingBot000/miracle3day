import InstagramFeed from './InstagramFeed';

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Beauty Creators
          </h1>
          <p className="text-gray-600">
            Check out our featured K-beauty creators
          </p>
        </div>

        {/* Instagram Feed */}
        <InstagramFeed 
          feedId="bccc1448-efd4-4895-af05-a47a57c4531d"
          className="max-w-6xl mx-auto"
        />

        {/* 추가 콘텐츠 */}
        <div className="mt-12 text-center">
          <button className="bg-pink-500 text-white px-8 py-3 rounded-lg">
            View More Creators
          </button>
        </div>
      </div>
    </div>
  );
}
module FindOffice
  extend ActiveSupport::Concern

  def find_office(office_id)
    Office.find(office_id)
  rescue KeyError, ActiveRecord::RecordNotFound
  end
end
